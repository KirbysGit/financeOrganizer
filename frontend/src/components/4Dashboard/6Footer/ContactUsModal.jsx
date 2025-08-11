// ContactUsModal.jsx

// This is the modal that allows the user to contact me. It's a modal that allows the user to select a topic,
// describe the issue, and attach files. It also allows the user to send the message to the Centi gmail, just allowing
// for a more specific way of communication about the site directly.

// Imports.
import React, { useState, useRef } from 'react';
import { styled, keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimes, 
    faPaperPlane, 
    faFileUpload, 
    faCheckCircle,
    faExclamationTriangle,
    faBug,
    faChartLine,
    faShieldAlt,
    faLightbulb,
    faQuestionCircle,
    faCog,
    faTrash
} from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';
import { submitContactForm } from '../../../services/api';

// -------------------------------------------------------- Animations.

// Fade In.
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

// Slide Up.
const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

// Bounce.
const bounce = keyframes`
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0, -30px, 0); }
    70% { transform: translate3d(0, -15px, 0); }
    90% { transform: translate3d(0, -4px, 0); }
`;

// Pulse.
const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

// -------------------------------------------------------- Contact Us Modal Component.
const ContactUsModal = ({ isOpen, onClose, user }) => {
    // -------------------------------------------------------- Form States.
    const [topic, setTopic] = useState('');                             // State 4 Topic.
    const [description, setDescription] = useState('');                 // State 4 Description.
    const [otherTopic, setOtherTopic] = useState('');                   // State 4 Other Topic.
    const [attachments, setAttachments] = useState([]);                 // State 4 Attachments.
    const [isSubmitting, setIsSubmitting] = useState(false);            // State 4 If The Form Is Submitting.
    const [showSuccess, setShowSuccess] = useState(false);              // State 4 If The Success Message Is Showing.
    const [errors, setErrors] = useState({});                           // State 4 Errors.
    
    // -------------------------------------------------------- File Input Ref.
    const fileInputRef = useRef(null);                                  // Ref 4 File Input.

    // -------------------------------------------------------- Topic Options.
    const topicOptions = [
        { value: 'general', label: 'General Inquiry', icon: faQuestionCircle, color: '#007bff' },
        { value: 'bug', label: 'Bug Report', icon: faBug, color: '#dc3545' },
        { value: 'data', label: 'Data Issues', icon: faChartLine, color: '#28a745' },
        { value: 'security', label: 'Security Concern', icon: faShieldAlt, color: '#ffc107' },
        { value: 'feature', label: 'Feature Request', icon: faLightbulb, color: '#17a2b8' },
        { value: 'account', label: 'Account Issues', icon: faCog, color: '#6f42c1' },
        { value: 'other', label: 'Other', icon: faExclamationTriangle, color: '#6c757d' }
    ];

    // -------------------------------------------------------- Handle File Upload.
    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/'];
            
            if (file.size > maxSize) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            
            if (!allowedTypes.some(type => file.type.startsWith(type))) {
                alert(`File ${file.name} is not a supported type.`);
                return false;
            }
            
            return true;
        });
        
        setAttachments(prev => [...prev, ...validFiles]);
    };

    // -------------------------------------------------------- Remove File.
    const handleRemoveFile = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // -------------------------------------------------------- Validate Form.
    const validateForm = () => {
        const newErrors = {};
        
        if (!topic) {
            newErrors.topic = 'Please select a topic';
        }
        
        if (topic === 'other' && !otherTopic.trim()) {
            newErrors.otherTopic = 'Please describe your topic';
        }
        
        if (!description.trim()) {
            newErrors.description = 'Please provide a description';
        }
        
        if (description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // -------------------------------------------------------- Handle Submit.
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Prepare Contact Form Data.
            const contactData = {
                user_id: user?.id,
                user_email: user?.email,
                user_name: `${user?.first_name} ${user?.last_name}`.trim() || 'Anonymous User',
                topic: topic === 'other' ? otherTopic : topicOptions.find(t => t.value === topic)?.label,
                description: description.trim(),
                attachments: attachments.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type
                }))
            };
            
            // Submit To Backend API.
            const response = await submitContactForm(contactData);
            
            // Show Success Message.
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 3000);
            
        } catch (error) {
            console.error('Error submitting contact form:', error);
            let errorMessage = 'There was an error submitting your message. Please try again.';
            
            if (error.response?.data?.detail) {
                if (typeof error.response.data.detail === 'string') {
                    errorMessage = error.response.data.detail;
                } else if (Array.isArray(error.response.data.detail)) {
                    errorMessage = error.response.data.detail.map(err => err.msg).join(', ');
                }
            }
            
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // -------------------------------------------------------- Handle Close.
    const handleClose = () => {
        if (!isSubmitting) {
            setTopic('');
            setDescription('');
            setOtherTopic('');
            setAttachments([]);
            setErrors({});
            onClose();
        }
    };

    // -------------------------------------------------------- Handle File Input Click.
    const handleFileInputClick = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <>
            <ModalOverlay onClick={handleClose}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <ModalHeader>
                        <ModalTitle>Contact Us</ModalTitle>
                        <CloseButton onClick={handleClose} disabled={isSubmitting}>
                            <FontAwesomeIcon icon={faTimes} />
                        </CloseButton>
                    </ModalHeader>

                    {/* Form */}
                    <ModalBody>
                        <Form onSubmit={handleSubmit}>
                            {/* Topic Selection */}
                            <FormSection>
                                <SectionTitle>What can we help you with?</SectionTitle>
                                <TopicGrid>
                                    {topicOptions.map((option) => (
                                        <TopicOption
                                            key={option.value}
                                            $selected={topic === option.value}
                                            $color={option.color}
                                            onClick={() => setTopic(option.value)}
                                            type="button"
                                        >
                                            <TopicIcon $color={option.color}>
                                                <FontAwesomeIcon icon={option.icon} />
                                            </TopicIcon>
                                            <TopicLabel>{option.label}</TopicLabel>
                                        </TopicOption>
                                    ))}
                                </TopicGrid>
                                {errors.topic && <ErrorMessage>{errors.topic}</ErrorMessage>}
                            </FormSection>

                            {/* Other Topic Input */}
                            {topic === 'other' && (
                                <FormSection>
                                    <SectionTitle>Please describe your topic</SectionTitle>
                                    <TextArea
                                        value={otherTopic}
                                        onChange={(e) => setOtherTopic(e.target.value)}
                                        placeholder="Please describe what you'd like to discuss..."
                                        rows={3}
                                    />
                                    {errors.otherTopic && <ErrorMessage>{errors.otherTopic}</ErrorMessage>}
                                </FormSection>
                            )}

                            {/* Description */}
                            <FormSection>
                                <SectionTitle>Tell us more</SectionTitle>
                                <TextArea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please provide details about your inquiry, issue, or feedback..."
                                    rows={6}
                                />
                                <CharCount $error={description.length < 10 && description.length > 0} $below500={description.length < 500}>
                                    {description.length}/500 characters (Min 10, Max 500)
                                </CharCount>
                                {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
                            </FormSection>

                            {/* File Attachments */}
                            <FormSection>
                                <SectionTitle>Attachments (Optional)</SectionTitle>
                                <FileUploadArea onClick={handleFileInputClick}>
                                    <FileUploadIcon>
                                        <FontAwesomeIcon icon={faFileUpload} />
                                    </FileUploadIcon>
                                    <FileUploadText>
                                        Click to upload files or drag and drop
                                    </FileUploadText>
                                    <FileUploadSubtext>
                                        Max 10MB per file • Images, PDFs, and text files
                                    </FileUploadSubtext>
                                </FileUploadArea>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    accept="image/*,.pdf,.txt,.doc,.docx"
                                />

                                {/* File List */}
                                {attachments.length > 0 && (
                                    <FileList>
                                        {attachments.map((file, index) => (
                                            <FileItem key={index}>
                                                <FileInfo>
                                                    <FileName>{file.name}</FileName>
                                                    <FileSize>{(file.size / 1024).toFixed(1)}KB</FileSize>
                                                </FileInfo>
                                                <RemoveFileButton
                                                    onClick={() => handleRemoveFile(index)}
                                                    type="button"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </RemoveFileButton>
                                            </FileItem>
                                        ))}
                                    </FileList>
                                )}
                            </FormSection>

                            {/* Submit Button */}
                            <SubmitButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <FontAwesomeIcon icon={faCog} spin />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                        Send Message
                                    </>
                                )}
                            </SubmitButton>
                        </Form>
                    </ModalBody>
                </ModalContent>
            </ModalOverlay>

            {/* Success Toast */}
            {showSuccess && (
                <SuccessToast>
                    <SuccessIcon>
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </SuccessIcon>
                    <SuccessMessage>
                        Message sent successfully! We'll get back to you at <strong>{user?.email}</strong> soon.
                    </SuccessMessage>
                </SuccessToast>
            )}
        </>
    );
};

// -------------------------------------------------------- Styled Components.

// -------------------------------------------------------- Modal Overlay.
const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease-out;
    padding: 1rem;
`;

// -------------------------------------------------------- Modal Header.
const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

// -------------------------------------------------------- Modal Title.
const ModalTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
`;

// -------------------------------------------------------- Modal Body.
const ModalBody = styled.div`
    padding: 2rem;
`;

// -------------------------------------------------------- Form.
const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

// -------------------------------------------------------- Form Section.
const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

// -------------------------------------------------------- Section Title.
const SectionTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
`;

// -------------------------------------------------------- Topic Grid.
const TopicGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    
    /* Center the last item (Other) when there are 7 items */
    &:has(> *:nth-child(7):last-child) {
        grid-template-columns: repeat(3, 1fr);
        
        > *:nth-child(7) {
            grid-column: 2;
        }
    }
`;

// -------------------------------------------------------- Topic Option.
const TopicOption = styled.button`
    font: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    border: 2px solid ${props => props.$selected ? props.$color : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 12px;
    background: ${props => props.$selected ? `${props.$color}10` : 'white'};
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: ${props => props.$color};
        background: ${props => `${props.$color}10`};
    }
`;

// -------------------------------------------------------- Topic Icon.
const TopicIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

// -------------------------------------------------------- Topic Label.
const TopicLabel = styled.span`
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    text-align: center;
`;

// -------------------------------------------------------- Text Area.
const TextArea = styled.textarea`
    width: 100%;
    padding: 1rem;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    min-height: 120px;
    transition: all 0.3s ease;
    background: white;
    
    &:focus {
        outline: none;
        border: 2px solid transparent;
        background: linear-gradient(white, white) padding-box,
                    linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        transform: translateY(-1px);
    }
    
    &::placeholder {
        color: var(--text-secondary);
    }
`;

// -------------------------------------------------------- Char Count.
const CharCount = styled.div`
    font-size: 0.8rem;
    color: ${props => props.$error ? '#dc3545' : props.$below500 ? 'var(--amount-positive)' : 'var(--text-secondary)'};
    text-align: right;
`;

// -------------------------------------------------------- File Upload Area.
const FileUploadArea = styled.div`
    border: 2px dashed rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fafafa;
    
    &:hover {
        border-color: var(--button-primary);
        background: #f0f8ff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
    }
    
    &:focus-within {
        border: 2px solid transparent;
        background: linear-gradient(white, white) padding-box,
                    linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        transform: translateY(-1px);
    }
`;

// -------------------------------------------------------- File Upload Icon.
const FileUploadIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3);
`;

// -------------------------------------------------------- File Upload Text.
const FileUploadText = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
`;

// -------------------------------------------------------- File Upload Subtext.
const FileUploadSubtext = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

// -------------------------------------------------------- File List.
const FileList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
`;

// -------------------------------------------------------- File Item.
const FileItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(0, 0, 0, 0.08);
        transform: translateX(2px);
    }
`;

// -------------------------------------------------------- File Info.
const FileInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

// -------------------------------------------------------- File Name.
const FileName = styled.span`
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
`;

// -------------------------------------------------------- File Size.
const FileSize = styled.span`
    font-size: 0.8rem;
    color: var(--text-secondary);
`;

// -------------------------------------------------------- Remove File Button.
const RemoveFileButton = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(220, 53, 69, 0.2);
        transform: scale(1.1);
    }
`;

// -------------------------------------------------------- Submit Button.
const SubmitButton = styled.button`
    font: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    position: relative;
    overflow: hidden;
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    &:hover::before {
        left: 100%;
    }
`;

// -------------------------------------------------------- Error Message.
const ErrorMessage = styled.div`
    color: #dc3545;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    border: 1px solid #f5c6cb;
    padding: 0.75rem;
    border-radius: 8px;
    animation: fadeIn 0.3s ease-in;
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

// -------------------------------------------------------- Success Toast.
const SuccessToast = styled.div`
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 1001;
    animation: ${slideUp} 0.4s ease-out;
    max-width: 400px;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #28a745, #20c997) border-box;
`;

// -------------------------------------------------------- Success Icon.
const SuccessIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #28a745, #20c997);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    animation: ${bounce} 1s ease-out;
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
`;

// -------------------------------------------------------- Success Message.
const SuccessMessage = styled.div`
    color: var(--text-primary);
    font-size: 0.95rem;
    line-height: 1.4;
`;

// -------------------------------------------------------- Modal Content.
const ModalContent = styled.div`
    background: white;
    border-radius: 20px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: ${slideUp} 0.4s ease-out;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, var(--button-primary), var(--amount-positive)) border-box;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
`;

// -------------------------------------------------------- Close Button.
const CloseButton = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    font-size: 1.2rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

    &:hover:not(:disabled) {
        opacity: 0.8;
        transform: scale(1.1);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// -------------------------------------------------------- Export The ContactUsModal Component.
export default ContactUsModal;
