package com.mrdev.common.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class IpResolverTest {

    private IpResolver ipResolver;

    @BeforeEach
    void setUp() {
        ipResolver = new IpResolver();
    }

    @Test
    @DisplayName("Should extract client IP from direct remote address")
    void testDirectRemoteAddress() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("198.51.100.42");

        String ip = ipResolver.resolveClientIp(request);
        assertThat(ip).isEqualTo("198.51.100.42");
    }

    @Test
    @DisplayName("Should extract leftmost client IP from X-Forwarded-For chain")
    void testXForwardedForMultipleIps() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.195, 70.41.3.18, 150.172.238.178");
        request.setRemoteAddr("10.0.0.1");

        String ip = ipResolver.resolveClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.195");
    }

    @Test
    @DisplayName("Should extract client IP from X-Real-IP header")
    void testXRealIp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Real-IP", "192.0.2.1");
        request.setRemoteAddr("10.0.0.1");

        String ip = ipResolver.resolveClientIp(request);
        assertThat(ip).isEqualTo("192.0.2.1");
    }

    @Test
    @DisplayName("Should normalize IPv6 localhost ::1 to 127.0.0.1")
    void testIpv6Localhost() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("0:0:0:0:0:0:0:1");

        String ip = ipResolver.resolveClientIp(request);
        assertThat(ip).isEqualTo("127.0.0.1");

        MockHttpServletRequest request2 = new MockHttpServletRequest();
        request2.setRemoteAddr("::1");
        assertThat(ipResolver.resolveClientIp(request2)).isEqualTo("127.0.0.1");
    }

    @Test
    @DisplayName("Should skip 'unknown' string in headers and fallback to remoteAddr")
    void testUnknownInHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "unknown");
        request.setRemoteAddr("198.51.100.5");

        String ip = ipResolver.resolveClientIp(request);
        assertThat(ip).isEqualTo("198.51.100.5");
    }

    @Test
    @DisplayName("Should return unknown for null request or empty request")
    void testNullOrEmptyRequest() {
        assertThat(ipResolver.resolveClientIp(null)).isEqualTo("unknown");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("");
        assertThat(ipResolver.resolveClientIp(request)).isEqualTo("unknown");
    }
}
