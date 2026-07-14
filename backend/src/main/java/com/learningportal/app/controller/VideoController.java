package com.learningportal.app.controller;

import com.learningportal.app.dto.ApiResponse;
import com.learningportal.app.dto.VideoDTO;
import com.learningportal.app.repository.UserRepository;
import com.learningportal.app.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VideoDTO>>> getAllVideos(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(videoService.getAllVideos(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VideoDTO>> getVideoById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(videoService.getVideoById(id, userId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<VideoDTO>>> searchVideos(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(videoService.searchVideos(q, userId)));
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<ApiResponse<List<VideoDTO>>> getBySubject(
            @PathVariable String subject,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(videoService.getVideosBySubject(subject, userId)));
    }

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<String>>> getAllSubjects() {
        return ResponseEntity.ok(ApiResponse.success(videoService.getAllSubjects()));
    }

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElse(null);
    }
}
