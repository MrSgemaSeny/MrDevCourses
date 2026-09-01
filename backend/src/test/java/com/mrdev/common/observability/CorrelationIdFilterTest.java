package com.mrdev.common.observability;

import com.mrdev.common.ratelimit.IpResolver;
import io.micrometer.tracing.Span;
import io.micrometer.tracing.TraceContext;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.MDC;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CorrelationIdFilterTest {

    @Mock
    private IpResolver ipResolver;

    @Mock
    private ObjectProvider<Tracer> tracerProvider;

    @Mock
    private Tracer tracer;

    @Mock
    private Span currentSpan;

    @Mock
    private TraceContext traceContext;

    @Mock
    private FilterChain filterChain;

    private CorrelationIdFilter correlationIdFilter;

    @BeforeEach
    void setUp() {
        correlationIdFilter = new CorrelationIdFilter(ipResolver, tracerProvider);
        MDC.clear();
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    @DisplayName("Generates new X-Request-ID and sets it in response and MDC when header is missing")
    void testGeneratesNewRequestIdWhenMissing() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(ipResolver.resolveClientIp(request)).thenReturn("192.168.1.100");
        when(tracerProvider.getIfAvailable()).thenReturn(null);

        doAnswer(invocation -> {
            // Verify MDC inside filter execution
            assertThat(MDC.get(CorrelationIdFilter.MDC_REQUEST_ID)).isNotNull().isNotBlank();
            assertThat(MDC.get(CorrelationIdFilter.MDC_CLIENT_IP)).isEqualTo("192.168.1.100");
            return null;
        }).when(filterChain).doFilter(any(), any());

        correlationIdFilter.doFilter(request, response, filterChain);

        // Verify response header set
        String resHeader = response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER);
        assertThat(resHeader).isNotNull().isNotBlank();

        // Verify MDC cleaned up after request
        assertThat(MDC.get(CorrelationIdFilter.MDC_REQUEST_ID)).isNull();
    }

    @Test
    @DisplayName("Propagates incoming X-Request-ID and populates traceId from Micrometer Tracer")
    void testPropagatesIncomingRequestIdAndTraceId() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, "custom-frontend-req-123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(ipResolver.resolveClientIp(request)).thenReturn("10.0.0.1");
        when(tracerProvider.getIfAvailable()).thenReturn(tracer);
        when(tracer.currentSpan()).thenReturn(currentSpan);
        when(currentSpan.context()).thenReturn(traceContext);
        when(traceContext.traceId()).thenReturn("4bf92f3577b34da6a3ce929d0e0e4736");
        when(traceContext.spanId()).thenReturn("00f067aa0ba902b7");

        doAnswer(invocation -> {
            assertThat(MDC.get(CorrelationIdFilter.MDC_REQUEST_ID)).isEqualTo("custom-frontend-req-123");
            assertThat(MDC.get(CorrelationIdFilter.MDC_TRACE_ID)).isEqualTo("4bf92f3577b34da6a3ce929d0e0e4736");
            assertThat(MDC.get(CorrelationIdFilter.MDC_SPAN_ID)).isEqualTo("00f067aa0ba902b7");
            assertThat(MDC.get(CorrelationIdFilter.MDC_CLIENT_IP)).isEqualTo("10.0.0.1");
            return null;
        }).when(filterChain).doFilter(any(), any());

        correlationIdFilter.doFilter(request, response, filterChain);

        assertThat(response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).isEqualTo("custom-frontend-req-123");
        assertThat(MDC.get(CorrelationIdFilter.MDC_REQUEST_ID)).isNull();
    }
}
