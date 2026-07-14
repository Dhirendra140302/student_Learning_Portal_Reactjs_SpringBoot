package com.learningportal.app.service;

import com.learningportal.app.dto.WatchProgressDTO;
import com.learningportal.app.dto.WatchProgressRequest;
import com.learningportal.app.entity.User;
import com.learningportal.app.entity.Video;
import com.learningportal.app.entity.WatchProgress;
import com.learningportal.app.repository.UserRepository;
import com.learningportal.app.repository.VideoRepository;
import com.learningportal.app.repository.WatchProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchProgressService {

    private final WatchProgressRepository watchProgressRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    @Transactional(readOnly = true)
    public List<WatchProgressDTO> getContinueWatching(Long userId) {
        return watchProgressRepository.findContinueWatchingByUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WatchProgressDTO> getRecentlyWatched(Long userId) {
        return watchProgressRepository.findRecentlyWatchedByUserId(userId).stream()
                .limit(10)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WatchProgressDTO getProgressForVideo(Long userId, Long videoId) {
        return watchProgressRepository.findByUserIdAndVideoId(userId, videoId)
                .map(this::toDTO)
                .orElse(null);
    }

    @Transactional
    public WatchProgressDTO saveProgress(Long userId, WatchProgressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new IllegalArgumentException("Video not found"));

        WatchProgress progress = watchProgressRepository
                .findByUserIdAndVideoId(userId, request.getVideoId())
                .orElse(WatchProgress.builder().user(user).video(video).build());

        progress.setProgressSeconds(request.getProgressSeconds());
        progress.setProgressPercent(request.getProgressPercent());

        // Mark completed if >= 90% watched
        if (request.getProgressPercent() >= 90.0) {
            progress.setCompleted(true);
        }

        return toDTO(watchProgressRepository.save(progress));
    }

    private WatchProgressDTO toDTO(WatchProgress wp) {
        return WatchProgressDTO.builder()
                .id(wp.getId())
                .videoId(wp.getVideo().getId())
                .videoTitle(wp.getVideo().getTitle())
                .videoThumbnailUrl(wp.getVideo().getThumbnailUrl())
                .videoDurationSeconds(wp.getVideo().getDurationSeconds())
                .progressSeconds(wp.getProgressSeconds())
                .progressPercent(wp.getProgressPercent())
                .completed(wp.isCompleted())
                .firstWatchedAt(wp.getFirstWatchedAt())
                .lastWatchedAt(wp.getLastWatchedAt())
                .build();
    }
}
