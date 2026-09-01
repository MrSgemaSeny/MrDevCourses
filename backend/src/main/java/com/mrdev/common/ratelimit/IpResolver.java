package com.mrdev.common.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class IpResolver {

    private static final String[] TRUSTED_PROXY_HEADERS = {
            "Fly-Client-IP",
            "CF-Connecting-IP",
            "True-Client-IP"
    };

    private static final String[] IP_HEADER_CANDIDATES = {
            "Fly-Client-IP",
            "CF-Connecting-IP",
            "True-Client-IP",
            "X-Real-IP",
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_CLIENT_IP"
    };

    private static final java.util.regex.Pattern IPV4_PATTERN = java.util.regex.Pattern.compile(
            "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$"
    );

    public String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        // 1. Check tamper-proof proxy headers first (Fly.io / Cloudflare)
        for (String header : TRUSTED_PROXY_HEADERS) {
            String ip = request.getHeader(header);
            if (isValidIp(ip)) {
                return normalizeIp(ip.trim());
            }
        }

        // 2. Check general forwarded headers (parsing leftmost client IP in chain)
        for (String header : IP_HEADER_CANDIDATES) {
            String ipList = request.getHeader(header);
            if (StringUtils.hasText(ipList) && !"unknown".equalsIgnoreCase(ipList.trim())) {
                String[] ips = ipList.split(",");
                for (String ip : ips) {
                    String trimmedIp = ip.trim();
                    if (isValidIp(trimmedIp)) {
                        return normalizeIp(trimmedIp);
                    }
                }
            }
        }

        // 3. Fallback to direct TCP remote address
        String remoteAddr = request.getRemoteAddr();
        if (StringUtils.hasText(remoteAddr)) {
            return normalizeIp(remoteAddr.trim());
        }

        return "unknown";
    }

    private boolean isValidIp(String ip) {
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip.trim())) {
            return false;
        }
        String trimmed = ip.trim();
        if ("0:0:0:0:0:0:0:1".equals(trimmed) || "::1".equals(trimmed) || "127.0.0.1".equals(trimmed)) {
            return true;
        }
        if (IPV4_PATTERN.matcher(trimmed).matches()) {
            return true;
        }
        // Basic IPv6 check
        return trimmed.contains(":") && trimmed.length() <= 45;
    }

    private String normalizeIp(String ip) {
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }
        return ip;
    }
}
