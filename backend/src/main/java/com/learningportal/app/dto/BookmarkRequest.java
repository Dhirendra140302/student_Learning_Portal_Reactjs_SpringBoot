package com.learningportal.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class BookmarkRequest {

    private String name;

    private String notes;

    @NotNull(message = "Timestamp is required")
    @PositiveOrZero(message = "Timestamp must be zero or positive")
    private Double timestampSeconds;

    @NotNull(message = "Video ID is required")
    private Long videoId;
}
