client<llm> DeslopOpus45 {
  provider anthropic
  retry_policy Exponential
  options {
    model "claude-opus-4-5"
    api_key env.ANTHROPIC_API_KEY
    temperature 0.2
  }
}

retry_policy Exponential {
  max_retries 2
  strategy {
    type exponential_backoff
    delay_ms 300
    multiplier 1.5
    max_delay_ms 10000
  }
}
