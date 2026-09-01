package com.mrdev.common.util;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.Serializable;

import static org.assertj.core.api.Assertions.assertThat;

class CookieUtilsTest {

    static class SampleData implements Serializable {
        private static final long serialVersionUID = 1L;
        String name;
        int value;

        SampleData(String name, int value) {
            this.name = name;
            this.value = value;
        }
    }

    @Test
    @DisplayName("Should serialize and safely deserialize valid signed cookie")
    void testSerializeAndDeserializeValidCookie() {
        SampleData original = new SampleData("test-request", 42);
        String serialized = CookieUtils.serialize(original);

        assertThat(serialized).isNotNull();
        assertThat(serialized).contains(".");

        Cookie cookie = new Cookie("test_cookie", serialized);
        SampleData deserialized = CookieUtils.deserialize(cookie, SampleData.class);

        assertThat(deserialized).isNotNull();
        assertThat(deserialized.name).isEqualTo("test-request");
        assertThat(deserialized.value).isEqualTo(42);
    }

    @Test
    @DisplayName("Should reject cookie with tampered signature without deserializing")
    void testRejectTamperedSignature() {
        SampleData original = new SampleData("legitimate", 100);
        String serialized = CookieUtils.serialize(original);

        String[] parts = serialized.split("\\.");
        String fakeSignature = "invalidFakeSignature1234567890";
        String tamperedCookieValue = fakeSignature + "." + parts[1];

        Cookie cookie = new Cookie("tampered_cookie", tamperedCookieValue);
        SampleData result = CookieUtils.deserialize(cookie, SampleData.class);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should reject cookie with tampered payload")
    void testRejectTamperedPayload() {
        SampleData original = new SampleData("legitimate", 100);
        String serialized = CookieUtils.serialize(original);

        String[] parts = serialized.split("\\.");
        String tamperedPayload = parts[1] + "tamperedExtraBytes";
        String tamperedCookieValue = parts[0] + "." + tamperedPayload;

        Cookie cookie = new Cookie("tampered_cookie", tamperedCookieValue);
        SampleData result = CookieUtils.deserialize(cookie, SampleData.class);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should safely handle null or empty cookie")
    void testNullOrEmptyCookie() {
        assertThat(CookieUtils.deserialize(null, SampleData.class)).isNull();
        assertThat(CookieUtils.deserialize(new Cookie("empty", ""), SampleData.class)).isNull();
        assertThat(CookieUtils.deserialize(new Cookie("no_dot", "unsignedrawstring"), SampleData.class)).isNull();
    }
}