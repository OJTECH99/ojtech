package com.ojtechapi.spring.jwtoauth.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    Map<String, Object> upload(MultipartFile file, String folder) throws IOException;
    Map<String, Object> uploadWithPreset(MultipartFile file, String folder, String preset) throws IOException;
    String uploadImage(MultipartFile file) throws IOException;
    String uploadPdf(MultipartFile file, String preset) throws IOException;
    void delete(String publicId) throws IOException;
}
