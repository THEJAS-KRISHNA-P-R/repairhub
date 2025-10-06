package com.repairhub.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_posts")
public class RepairPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "item_name", nullable = false)
    private String itemName;
    
    @Column(name = "issue_description", columnDefinition = "TEXT")
    private String issueDescription;
    
    @Column(name = "repair_steps", columnDefinition = "TEXT")
    private String repairSteps;
    
    @Column(nullable = false)
    private Boolean success = false;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(columnDefinition = "JSON")
    private String images;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public RepairPost() {}
    
    public RepairPost(User user, String itemName, String issueDescription, String repairSteps, Boolean success, LocalDate date) {
        this.user = user;
        this.itemName = itemName;
        this.issueDescription = issueDescription;
        this.repairSteps = repairSteps;
        this.success = success;
        this.date = date;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getItemName() {
        return itemName;
    }
    
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
    
    public String getIssueDescription() {
        return issueDescription;
    }
    
    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }
    
    public String getRepairSteps() {
        return repairSteps;
    }
    
    public void setRepairSteps(String repairSteps) {
        this.repairSteps = repairSteps;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public String getImages() {
        return images;
    }
    
    public void setImages(String images) {
        this.images = images;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

