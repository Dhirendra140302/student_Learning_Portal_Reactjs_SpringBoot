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
public class WatchProgressDTO {
    private Long id;
    private Long videoId;
    private String videoTitle;
    private String videoThumbnailUrl;
    private Integer videoDurationSeconds;
    private Double progressSeconds;
    private Double progressPercent;
    private boolean completed;
    private LocalDateTime firstWatchedAt;
    private LocalDateTime lastWatchedAt;
}
