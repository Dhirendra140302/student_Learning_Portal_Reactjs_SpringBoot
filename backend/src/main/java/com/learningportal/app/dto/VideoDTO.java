package com.learningportal.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDTO {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private String subject;
    private String instructor;
    private Integer durationSeconds;
    private LocalDateTime createdAt;

    // Populated when fetching with user context
    private Double progressSeconds;
    private Double progressPercent;
    private boolean completed;
    private int bookmarkCount;
}
