package com.ojtechapi.spring.jwtoauth.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ojtechapi.spring.jwtoauth.dtos.requests.CompanyCreateRequest;
import com.ojtechapi.spring.jwtoauth.dtos.responses.CompanyResponseDTO;
import com.ojtechapi.spring.jwtoauth.dtos.responses.MessageResponse;
import com.ojtechapi.spring.jwtoauth.entities.Company;
import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import com.ojtechapi.spring.jwtoauth.repositories.NLOProfileRepository;
import com.ojtechapi.spring.jwtoauth.security.services.UserDetailsImpl;
import com.ojtechapi.spring.jwtoauth.service.CompanyService;

import jakarta.validation.Valid;

/**
 * NLO-specific Company Controller
 * Handles company profile management for NLO staff
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/nlo/companies")
@PreAuthorize("hasRole('ROLE_NLO')") // NLO users have NLO role
public class NLOCompanyController {

    private static final Logger logger = LoggerFactory.getLogger(NLOCompanyController.class);

    @Autowired
    private CompanyService companyService;

    @Autowired
    private NLOProfileRepository NLOProfileRepository;

    /**
     * Get all companies
     */
    @GetMapping
    public ResponseEntity<?> getAllCompanies(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            List<Company> companies = companyService.getAllCompanies();
            List<CompanyResponseDTO> response = companies.stream()
                    .map(CompanyResponseDTO::new)
                    .collect(Collectors.toList());

            logger.info("NLO user {} fetched {} companies", userDetails.getUsername(), companies.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching companies for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error fetching companies: " + e.getMessage()));
        }
    }

    /**
     * Get active companies only
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveCompanies(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            List<Company> companies = companyService.getActiveCompanies();
            List<CompanyResponseDTO> response = companies.stream()
                    .map(CompanyResponseDTO::new)
                    .collect(Collectors.toList());

            logger.info("NLO user {} fetched {} active companies", userDetails.getUsername(), companies.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching active companies for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error fetching active companies: " + e.getMessage()));
        }
    }

    /**
     * Get company by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCompanyById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            Company company = companyService.getCompanyById(id)
                    .orElseThrow(() -> new RuntimeException("Company not found"));

            CompanyResponseDTO response = new CompanyResponseDTO(company);
            logger.info("NLO user {} accessed company details for {}", userDetails.getUsername(), company.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching company for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error fetching company: " + e.getMessage()));
        }
    }

    /**
     * Create a new company
     */
    @PostMapping
    public ResponseEntity<?> createCompany(
            @Valid @RequestBody CompanyCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            // Get NLO profile
            NLOProfile nloProfile = NLOProfileRepository.findByUserId(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("NLO profile not found"));

            Company company = companyService.createCompany(request, nloProfile);
            CompanyResponseDTO response = new CompanyResponseDTO(company);

            logger.info("NLO user {} created company: {}", userDetails.getUsername(), company.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            logger.error("Error creating company for NLO user {}: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Error creating company: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating company for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error creating company: " + e.getMessage()));
        }
    }

    /**
     * Update a company
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompany(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            Company company = companyService.updateCompany(id, request);
            CompanyResponseDTO response = new CompanyResponseDTO(company);

            logger.info("NLO user {} updated company: {}", userDetails.getUsername(), company.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            logger.error("Error updating company for NLO user {}: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Error updating company: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating company for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error updating company: " + e.getMessage()));
        }
    }

    /**
     * Deactivate a company
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateCompany(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            Company company = companyService.deactivateCompany(id);
            CompanyResponseDTO response = new CompanyResponseDTO(company);

            logger.info("NLO user {} deactivated company: {}", userDetails.getUsername(), company.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            logger.error("Error deactivating company for NLO user {}: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Error deactivating company: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deactivating company for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error deactivating company: " + e.getMessage()));
        }
    }

    /**
     * Activate a company
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activateCompany(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }

            Company company = companyService.activateCompany(id);
            CompanyResponseDTO response = new CompanyResponseDTO(company);

            logger.info("NLO user {} activated company: {}", userDetails.getUsername(), company.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            logger.error("Error activating company for NLO user {}: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Error activating company: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error activating company for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error activating company: " + e.getMessage()));
        }
    }
}
