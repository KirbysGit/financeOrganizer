// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

// -------------------------------------------------------- UploadResultModal Component.
const UploadResultModal = ({ isOpen, onClose, uploadResult }) => {
    if (!isOpen || !uploadResult) return null;

    return (
        <Modal onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Upload Results</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </CloseButton>
                </ModalHeader>

                <ResultsSection>
                    <SuccessHeader>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <h3>Upload Successful!</h3>
                    </SuccessHeader>
                    
                    <ResultMessage>{uploadResult.message}</ResultMessage>
                    
                    <ResultsGrid>
                        <ResultCard>
                            <ResultLabel>New Transactions</ResultLabel>
                            <ResultValue $positive>{uploadResult.transactions_added}</ResultValue>
                        </ResultCard>
                        
                        <ResultCard>
                            <ResultLabel>Duplicates Skipped</ResultLabel>
                            <ResultValue $neutral>{uploadResult.transactions_skipped}</ResultValue>
                        </ResultCard>
                        
                        <ResultCard>
                            <ResultLabel>Total Rows Processed</ResultLabel>
                            <ResultValue $neutral>{uploadResult.total_rows_processed}</ResultValue>
                        </ResultCard>
                        
                        <ResultCard>
                            <ResultLabel>Total Amount</ResultLabel>
                            <ResultValue $amount>${uploadResult.total_amount_imported.toFixed(2)}</ResultValue>
                        </ResultCard>
                    </ResultsGrid>
                    
                    {uploadResult.processing_duration_ms && (
                        <ProcessingInfo>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            <span>Processed in {uploadResult.processing_duration_ms}ms</span>
                        </ProcessingInfo>
                    )}
                    
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <ErrorSection>
                            <h4>Errors Encountered:</h4>
                            <ErrorList>
                                {uploadResult.errors.map((error, index) => (
                                    <ErrorItem key={index}>{error}</ErrorItem>
                                ))}
                            </ErrorList>
                        </ErrorSection>
                    )}
                    
                    <ActionButton onClick={onClose} $primary>
                        Continue
                    </ActionButton>
                </ResultsSection>
            </ModalContent>
        </Modal>
    );
};

// -------------------------------------------------------- Styled Components.
const Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 2rem;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 24px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #999;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
        background: #f5f5f5;
        color: #333;
    }
`;

const ResultsSection = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const SuccessHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #28a745;
    font-size: 1.5rem;
    font-weight: 600;

    h3 {
        margin: 0;
    }
`;

const ResultMessage = styled.p`
    margin: 0;
    font-size: 1rem;
    color: #333;
    line-height: 1.5;
`;

const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
`;

const ResultCard = styled.div`
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    border: 1px solid #e9ecef;
`;

const ResultLabel = styled.div`
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.5rem;
    font-weight: 500;
`;

const ResultValue = styled.div`
    font-size: 1.2rem;
    font-weight: ${props => props.$positive ? '600' : props.$neutral ? '500' : 'bold'};
    color: ${props => {
        if (props.$positive) return '#28a745';
        if (props.$neutral) return '#666';
        if (props.$amount) return '#007bff';
        return '#333';
    }};
`;

const ProcessingInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-size: 0.9rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 8px;
`;

const ErrorSection = styled.div`
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    border: 1px solid #f5c6cb;
    border-radius: 12px;
    padding: 1rem;

    h4 {
        margin: 0 0 0.5rem 0;
        color: #721c24;
        font-size: 0.9rem;
    }
`;

const ErrorList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ErrorItem = styled.li`
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    color: #721c24;
    padding: 0.25rem 0;
    border-bottom: 1px solid rgba(114, 28, 36, 0.1);

    &:last-child {
        margin-bottom: 0;
        border-bottom: none;
    }
`;

const ActionButton = styled.button`
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    ${props => props.$primary ? `
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }
    ` : `
        background: #f8f9fa;
        color: #333;
        border: 2px solid #eee;

        &:hover:not(:disabled) {
            background: #e9ecef;
        }
    `}

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }
`;

export default UploadResultModal; 