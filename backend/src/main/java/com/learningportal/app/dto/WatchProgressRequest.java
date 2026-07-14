package com.learningportal.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class WatchProgressRequest {

    @NotNull(message = "Video ID is required")
    private Long videoId;

    @NotNull(message = "Progress in seconds is required")
    @PositiveOrZero
    private Double progressSeconds;

    @NotNull(message = "Progress percent is required")
    @PositiveOrZero
    private Double progressPercent;
}
