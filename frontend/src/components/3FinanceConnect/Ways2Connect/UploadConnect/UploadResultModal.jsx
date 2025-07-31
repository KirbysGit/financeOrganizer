// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

// ------------------------------------------------------------------------------------------------ Helper Functions.

// Clean up the upload result message for better display
const formatUploadMessage = (message) => {
    if (!message) return '';
    
    // Remove timestamp and clean up the message
    const cleanMessage = message
        .replace(/File uploaded successfully at \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}!/, 'File uploaded successfully!')
        .replace(/Added (\d+) new transactions to (.+) from (\d+) total rows\./, 'Added $1 new transactions to $2.')
        .replace(/Added (\d+) new transactions from (\d+) total rows\./, 'Added $1 new transactions.');
    
    return cleanMessage;
};

// Extract and format timestamp from the original message
const extractTimestamp = (message) => {
    if (!message) return null;
    
    const timestampMatch = message.match(/File uploaded successfully at (\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})!/);
    if (!timestampMatch) return null;
    
    const [, year, month, dayStr, hour, minute, second] = timestampMatch;
    const date = new Date(year, month - 1, dayStr, hour, minute, second);
    
    // Format as "June 16 at 2:01 PM"
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = monthNames[date.getMonth()];
    const dayNum = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `Uploaded ${monthName} ${dayNum} at ${displayHours}:${displayMinutes} ${ampm}`;
};

// -------------------------------------------------------- UploadResultModal Component.
const UploadResultModal = ({ isOpen, onClose, uploadResult }) => {
    if (!isOpen || !uploadResult) return null;

    return (
        <Modal onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Upload Results</ModalTitle>
                </ModalHeader>
                    <CloseButton onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </CloseButton>

                <ResultsSection>
                    <SuccessHeader>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <h3>Upload Successful!</h3>
                    </SuccessHeader>
                    
                    <ResultMessage>{formatUploadMessage(uploadResult.message)}</ResultMessage>
                    
                    {extractTimestamp(uploadResult.message) && (
                        <TimestampDisplay>
                            {extractTimestamp(uploadResult.message)}
                        </TimestampDisplay>
                    )}
                    
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
    justify-content: center;
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
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
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
    z-index: 1000;

    &:hover {
        opacity: 0.8;
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
    justify-content: center;
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

const TimestampDisplay = styled.div`
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
    text-align: center;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

const ResultCard = styled.div`
    background: rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        background: rgba(255, 255, 255, 0.4);
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
    justify-content: center;
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;

    ${props => props.$primary ? `
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }

        &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
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

    /* Add a subtle press effect */
    &:active:not(:disabled) {
        transform: scale(0.98);
    }
`;

export default UploadResultModal; 