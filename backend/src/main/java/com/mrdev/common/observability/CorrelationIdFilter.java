package com.mrdev.common.observability;

import com.mrdev.common.ratelimit.IpResolver;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String CORRELATION_ID_HEADER = "X-Request-ID";
    public static final String MDC_REQUEST_ID = "requestId";
    public static final String MDC_TRACE_ID = "traceId";
    public static final String MDC_SPAN_ID = "spanId";
    public static final String MDC_CLIENT_IP = "clientIp";

    private final IpResolver ipResolver;
    private final ObjectProvider<Tracer> tracerProvider;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String requestId = request.getHeader(CORRELATION_ID_HEADER);
        if (!StringUtils.hasText(requestId)) {
            requestId = UUID.randomUUID().toString();
        }

        // Set in response header so client receives the same correlation ID
        response.setHeader(CORRELATION_ID_HEADER, requestId);

        // Populate MDC
        MDC.put(MDC_REQUEST_ID, requestId);

        String clientIp = ipResolver.resolveClientIp(request);
        if (StringUtils.hasText(clientIp)) {
            MDC.put(MDC_CLIENT_IP, clientIp);
        }

        // Micrometer / OpenTelemetry Trace ID injection into MDC if active
        Tracer tracer = tracerProvider.getIfAvailable();
        if (tracer != null && tracer.currentSpan() != null) {
            String traceId = tracer.currentSpan().context().traceId();
            String spanId = tracer.currentSpan().context().spanId();
            if (StringUtils.hasText(traceId)) {
                MDC.put(MDC_TRACE_ID, traceId);
            }
            if (StringUtils.hasText(spanId)) {
                MDC.put(MDC_SPAN_ID, spanId);
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
