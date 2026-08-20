# Certificate Generator — Project Documentation

## Modules and Description

| Module | Description |
|---|---|
| Template Selector | Selects a built-in certificate template or accepts a custom certificate image upload. |
| Content Selector | Selects predefined certificate body content or allows custom body text with variables such as `{name}`, `{course}`, `{startDate}`, `{endDate}`, and `{durationMonths}`. |
| Signature Selector | Uploads one or more image-based signatures, previews them, removes them, and distributes them evenly across the certificate signature area. |
| Excel Uploader | Uploads the student spreadsheet and parses certificate data. |
| Validation | Checks student records, required values, invalid rows, and duplicate registration numbers. |
| Student Table | Displays uploaded student records and allows a student to be selected for preview. |
| Certificate Preview | Shows the selected certificate template with student information, body content, and uploaded signatures. |
| Certificate Generator | Renders certificate content and signature images onto the certificate background and exports a PDF. |
| ZIP Generator | Packages generated certificates into a downloadable ZIP file. |
| Reset and Download Actions | Downloads an individual certificate, downloads all certificates, or resets the current workflow. |

## Abstract

The Certificate Generator is a browser-based React application for creating completion and internship certificates from Excel student data. Users select a certificate template, choose or enter certificate content, upload image signatures, upload student records, preview certificates, and download individual or bulk-generated PDF certificates.

The application combines reusable certificate layouts with dynamic student information. Multiple signature images can be selected for a certificate. The available signature area is divided into equal slots according to the number of selected signatures so that the signatures remain visually balanced.

## Benefits

- Reduces manual certificate preparation time.
- Generates certificates consistently from structured Excel data.
- Supports built-in and custom certificate template images.
- Supports predefined and custom certificate content.
- Allows multiple image signatures on each certificate.
- Automatically aligns signatures according to their count.
- Provides validation feedback before certificate generation.
- Supports individual PDF downloads and bulk ZIP downloads.
- Provides an immediate certificate preview before downloading.
- Runs in the browser without requiring manual certificate editing software.

## Introduction

The project is designed for organizations that issue certificates to multiple students, trainees, interns, or course participants. Instead of entering each student's details manually into a certificate design, the user uploads an Excel file containing the student records.

The workflow is:

1. Select or upload a certificate template.
2. Select predefined content or enter custom certificate body content.
3. Upload one or more signature images.
4. Upload the student Excel file.
5. Review validation results and select a student.
6. Preview the generated certificate.
7. Download one certificate or generate all certificates as a ZIP file.

### Technology Used

- React 18
- TypeScript
- Vite
- jsPDF
- SheetJS (`xlsx`)
- JSZip
- File Saver
- HTML/CSS

### Important Project Locations

| Location | Purpose |
|---|---|
| `src/App.tsx` | Main application state and workflow orchestration. |
| `src/components/TemplateSelector` | Certificate template selection and upload. |
| `src/components/ContentSelector` | Body content selection and manual content entry. |
| `src/components/SignatureSelector` | Image signature upload, preview, and removal. |
| `src/components/CertificatePreview` | Live certificate preview. |
| `src/services/excelParser.ts` | Excel file parsing. |
| `src/services/certificateGenerator.ts` | PDF and certificate image generation. |
| `src/config/templateConfigs.ts` | Certificate templates, content, and field positions. |
| `src/types.ts` | Shared TypeScript data models. |

## Conclusion

The Certificate Generator provides a complete workflow for producing professional certificates from spreadsheet data. It centralizes template selection, content management, signature placement, validation, preview, and PDF generation in one application.

The signature image feature improves flexibility by allowing each certificate workflow to include the required number of signatures. Automatic slot distribution keeps the signatures aligned with the existing certificate design and ensures that the preview matches the downloaded PDF.

## Future Enhancement

- Save and reuse uploaded signature collections.
- Allow users to drag, resize, and position signatures visually.
- Store different signature layouts for different certificate templates.
- Add signature labels such as name, designation, and organization.
- Add support for transparent-background cleanup and image cropping.
- Add configurable signature area settings for each template.
- Add more spreadsheet column mappings and export formats.
- Add an option to generate PNG or JPG certificates.
- Add organization branding and reusable brand kits.
- Add authentication and cloud storage for templates and certificate history.
- Add automated email delivery of generated certificates.
- Add unit and end-to-end test coverage.

## Screen shots

### Course Completion Certificate Template

![Course completion certificate template](../src/assets/Capture.JPG)

This template contains the existing certificate layout and lower signature area used as the reference for uploaded signature placement.

### Internship Certificate Template

![Internship certificate template](../extracted_media/Intern.JPG)

The internship certificate uses the same general lower signature region, allowing the uploaded image signatures to remain visually consistent.

### Signature Image Asset

![Signature image example](../src/assets/signature.png)

Signature uploads must be image files. PNG images with transparent backgrounds are recommended for the cleanest result.

### Application Screens

The application screens include:

- Certificate template selection and custom template upload.
- Body content selection and custom content entry.
- Signature image selection with previews and remove controls.
- Excel upload and validation status.
- Student record table.
- Certificate preview with aligned signatures.
- Individual and bulk download actions.

