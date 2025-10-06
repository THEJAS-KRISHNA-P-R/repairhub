package com.repairhub.controller;

import com.repairhub.entity.Comment;
import com.repairhub.entity.RepairPost;
import com.repairhub.entity.User;
import com.repairhub.repository.CommentRepository;
import com.repairhub.repository.RepairPostRepository;
import com.repairhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CommentController {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private RepairPostRepository repairPostRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/repair-posts/{repairPostId}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long repairPostId) {
        List<Comment> comments = commentRepository.findByRepairPostIdOrderByDateAsc(repairPostId);
        List<Map<String, Object>> commentData = comments.stream()
                .map(comment -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", comment.getId());
                    map.put("user_id", comment.getUser().getId());
                    map.put("repair_post_id", comment.getRepairPost().getId());
                    map.put("content", comment.getContent());
                    map.put("parent_id", comment.getParent() != null ? comment.getParent().getId() : null);
                    map.put("date", comment.getDate());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(commentData);
    }
    
    @PostMapping("/repair-posts/{repairPostId}/comments")
    public ResponseEntity<Map<String, Object>> createComment(@PathVariable Long repairPostId, @RequestBody Map<String, Object> request) {
        String content = (String) request.get("content");
        Long userId = Long.valueOf(request.get("user_id").toString());
        Long parentId = request.get("parent_id") != null ? Long.valueOf(request.get("parent_id").toString()) : null;
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        Optional<RepairPost> repairPostOpt = repairPostRepository.findById(repairPostId);
        if (repairPostOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Repair post not found"));
        }
        
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(userOpt.get());
        comment.setRepairPost(repairPostOpt.get());
        comment.setDate(LocalDateTime.now());
        
        if (parentId != null) {
            Optional<Comment> parentOpt = commentRepository.findById(parentId);
            parentOpt.ifPresent(comment::setParent);
        }
        
        Comment savedComment = commentRepository.save(comment);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", savedComment.getId());
        response.put("user_id", savedComment.getUser().getId());
        response.put("repair_post_id", savedComment.getRepairPost().getId());
        response.put("content", savedComment.getContent());
        response.put("parent_id", savedComment.getParent() != null ? savedComment.getParent().getId() : null);
        response.put("date", savedComment.getDate());
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/repair-posts/{repairPostId}/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> updateComment(@PathVariable Long repairPostId, @PathVariable Long commentId, @RequestBody Map<String, Object> request) {
        Optional<Comment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Comment comment = commentOpt.get();
        
        if (request.containsKey("content")) {
            comment.setContent((String) request.get("content"));
        }
        
        Comment savedComment = commentRepository.save(comment);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", savedComment.getId());
        response.put("user_id", savedComment.getUser().getId());
        response.put("repair_post_id", savedComment.getRepairPost().getId());
        response.put("content", savedComment.getContent());
        response.put("parent_id", savedComment.getParent() != null ? savedComment.getParent().getId() : null);
        response.put("date", savedComment.getDate());
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/repair-posts/{repairPostId}/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable Long repairPostId, @PathVariable Long commentId) {
        if (!commentRepository.existsById(commentId)) {
            return ResponseEntity.notFound().build();
        }
        
        commentRepository.deleteById(commentId);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }
}

