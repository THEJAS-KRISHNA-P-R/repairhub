package com.repairhub.controller;

import com.repairhub.entity.RepairPost;
import com.repairhub.entity.User;
import com.repairhub.repository.RepairPostRepository;
import com.repairhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class RepairPostController {
    
    @Autowired
    private RepairPostRepository repairPostRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/repair-posts")
    public ResponseEntity<List<Map<String, Object>>> getRepairPosts() {
        List<RepairPost> repairPosts = repairPostRepository.findAllByOrderByIdDesc();
        List<Map<String, Object>> repairPostData = repairPosts.stream()
                .map(post -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", post.getId());
                    map.put("item_name", post.getItemName());
                    map.put("issue_description", post.getIssueDescription());
                    map.put("repair_steps", post.getRepairSteps());
                    map.put("success", post.getSuccess());
                    map.put("date", post.getDate());
                    map.put("user_id", post.getUser().getId());
                    map.put("images", post.getImages());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(repairPostData);
    }
    
    @GetMapping("/repair-posts/{id}")
    public ResponseEntity<Map<String, Object>> getRepairPost(@PathVariable Long id) {
        Optional<RepairPost> postOpt = repairPostRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        RepairPost post = postOpt.get();
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", post.getId());
        response.put("item_name", post.getItemName());
        response.put("issue_description", post.getIssueDescription());
        response.put("repair_steps", post.getRepairSteps());
        response.put("success", post.getSuccess());
        response.put("date", post.getDate());
        response.put("user_id", post.getUser().getId());
        response.put("images", post.getImages());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/repair-posts")
    public ResponseEntity<Map<String, Object>> createRepairPost(@RequestBody Map<String, Object> request) {
        String itemName = (String) request.get("item_name");
        String issueDescription = (String) request.get("issue_description");
        String repairSteps = (String) request.get("repair_steps");
        Boolean success = (Boolean) request.get("success");
        Long userId = Long.valueOf(request.get("user_id").toString());
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        RepairPost post = new RepairPost();
        post.setItemName(itemName);
        post.setIssueDescription(issueDescription);
        post.setRepairSteps(repairSteps);
        post.setSuccess(success != null ? success : false);
        post.setDate(LocalDate.now());
        post.setUser(userOpt.get());
        
        RepairPost savedPost = repairPostRepository.save(post);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", savedPost.getId());
        response.put("item_name", savedPost.getItemName());
        response.put("issue_description", savedPost.getIssueDescription());
        response.put("repair_steps", savedPost.getRepairSteps());
        response.put("success", savedPost.getSuccess());
        response.put("date", savedPost.getDate());
        response.put("user_id", savedPost.getUser().getId());
        response.put("images", savedPost.getImages());
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/repair-posts/{id}")
    public ResponseEntity<Map<String, Object>> updateRepairPost(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<RepairPost> postOpt = repairPostRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        RepairPost post = postOpt.get();
        
        if (request.containsKey("item_name")) {
            post.setItemName((String) request.get("item_name"));
        }
        if (request.containsKey("issue_description")) {
            post.setIssueDescription((String) request.get("issue_description"));
        }
        if (request.containsKey("repair_steps")) {
            post.setRepairSteps((String) request.get("repair_steps"));
        }
        if (request.containsKey("success")) {
            post.setSuccess((Boolean) request.get("success"));
        }
        
        RepairPost savedPost = repairPostRepository.save(post);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", savedPost.getId());
        response.put("item_name", savedPost.getItemName());
        response.put("issue_description", savedPost.getIssueDescription());
        response.put("repair_steps", savedPost.getRepairSteps());
        response.put("success", savedPost.getSuccess());
        response.put("date", savedPost.getDate());
        response.put("user_id", savedPost.getUser().getId());
        response.put("images", savedPost.getImages());
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/repair-posts/{id}")
    public ResponseEntity<Map<String, String>> deleteRepairPost(@PathVariable Long id) {
        if (!repairPostRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        repairPostRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Repair post deleted successfully"));
    }
}
