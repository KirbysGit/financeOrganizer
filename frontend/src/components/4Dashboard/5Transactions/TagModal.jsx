import React, { useState, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash, faTags, faHandshake, faStar, faPalette, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { getTags, createTag, deleteTag, addTagToTransaction, removeTagFromTransaction, initializeDefaultTags, getTagTransactionCount } from '../../../services/api';
import toast from 'react-hot-toast';

// ================================================================= STYLED COMPONENTS

const Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 2rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98));
    border-radius: 20px;
    max-width: 600px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 123, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */

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
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1.5rem 2rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9));
    border-radius: 20px 20px 0 0;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const WelcomeIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: var(--button-primary);
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: none;
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
    z-index: 1000;

    &:hover {
        opacity: 0.8;
    }
`;

const ModalBody = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const SectionTitle = styled.h3`
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    min-height: 60px;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(255, 255, 255, 0.9));
    border-radius: 12px;
    border: 2px dashed rgba(0, 123, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`;

const TagPill = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.color || '#6366f1'};
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid transparent;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
`;

const RemoveTagButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    font-size: 0.8rem;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }
`;

const AvailableTagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    max-height: 300px;
    margin-bottom: 0.75rem;
    overflow-y: auto;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(255, 255, 255, 0.9));
    border: 2px dashed rgba(0, 123, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
`;

const AvailableTag = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.color || '#6366f1'};
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: ${props => props.$isSelected ? 0.5 : 1};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 2px solid transparent;
    
    &:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.6);
    }
`;

const CreateTagSection = styled.div`
    padding-top: 0.75rem;
`;

const CreateTagForm = styled.form`
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 1rem;
    align-items: flex-end;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
`;

const InputLabel = styled.label`
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
`;

const FormInput = styled.input`
    font: inherit;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.3s ease;
    height: 48px;
    box-sizing: border-box;
    
    &:hover {
        border-color: var(--button-primary);
        background: white;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    
    &:focus {
        outline: none;
        border-color: var(--button-primary);
        background: white;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    
    &::placeholder {
        color: var(--text-secondary);
    }
`;

const EmojiInput = styled.div`
    position: relative;
    width: 60px;
    height: 48px;
`;

const EmojiButton = styled.button`
    width: 100%;
    height: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    color: var(--text-primary);
    font-size: 1.2rem;
    text-align: center;
    transition: all 0.3s ease;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        border-color: var(--button-primary);
        background: white;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    
    &:focus {
        outline: none;
        border-color: var(--button-primary);
        background: white;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

const CreateButton = styled.button`
    font: inherit;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 48px;
    white-space: nowrap;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    
    &:hover:not(:disabled) {
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: shimmer 0.5s ease-in-out;
        }
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
`;

const SaveButton = styled.button`
    font: inherit;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, var(--amount-positive), #059669);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const CancelButton = styled.button`
    font: inherit;
    padding: 0.75rem 2rem;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    color: var(--text-primary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 0, 0, 0.12);
    }
`;

const EmptyState = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-style: italic;
    text-align: center;
    gap: 0.5rem;
`;

const EmojiPicker = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    background: white;
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    max-height: 250px;
    overflow-y: auto;
    margin-top: 0.5rem;
    animation: slideDown 0.2s ease-out;
    
    &::before {
        content: '';
        position: absolute;
        top: -10px;
        left: 12px;
        width: 16px;
        height: 16px;
        background: white;
        border-left: 2px solid rgba(0, 0, 0, 0.08);
        border-top: 2px solid rgba(0, 0, 0, 0.08);
        transform: rotate(45deg);
        border-radius: 2px 0 0 0;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const EmojiGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const EmojiOption = styled.button`
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(0, 123, 255, 0.1);
        transform: scale(1.1);
    }
    
    &:focus {
        outline: none;
        background: rgba(0, 123, 255, 0.2);
    }
`;

const EmojiCategory = styled.div`
    margin-bottom: 1rem;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const CategoryTitle = styled.div`
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ColorPicker = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    background: white;
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    margin-top: 0.5rem;
    animation: slideDown 0.2s ease-out;
    
    &::before {
        content: '';
        position: absolute;
        top: -10px;
        right: 12px;
        width: 16px;
        height: 16px;
        background: white;
        border-left: 2px solid rgba(0, 0, 0, 0.08);
        border-top: 2px solid rgba(0, 0, 0, 0.08);
        transform: rotate(45deg);
        border-radius: 2px 0 0 0;
    }
`;

const ColorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
`;

const ColorOption = styled.button`
    width: 32px;
    height: 32px;
    border: 2px solid ${props => props.$isSelected ? 'white' : 'transparent'};
    background: ${props => props.color};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
    }
`;

const ColorButton = styled.button`
    height: 48px;
    width: 48px;
    padding: 0.75rem;
    background: ${props => props.color || '#f59e0b'};
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &:hover {
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        transform: translateY(-1px);
    }
    
    &:focus {
        outline: none;
        border-color: var(--button-primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

const DeleteButton = styled.button`
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: none;
    border-radius: 8px;
    color: white;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
`;

const ConfirmationModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ConfirmationContent = styled.div`
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 425px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
    
    @keyframes slideUp {
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

const ConfirmationTitle = styled.h3`
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #dc2626;
`;

const ConfirmationMessage = styled.p`
    margin: 0 0 0.5rem 0;
    color: var(--text-secondary);
    line-height: 1.5;
`;

const ConfirmationButtons = styled.div`
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
`;

const ConfirmButton = styled.button`
    font: inherit;
    font-size: 0.9rem;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
    }
`;

const CancelConfirmButton = styled.button`
    font: inherit;
    font-size: 0.9rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    color: var(--text-primary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 0, 0, 0.12);
    }
`;

// Transaction Details Styled Components
const TransactionDetailsSection = styled.div`
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    margin: 1.5rem 2rem 0rem 2rem;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        pointer-events: none;
    }
`;

const TransactionDetailsHeader = styled.div`
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 1;
`;

const TransactionDetailsContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
`;

const TransactionDetailsRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    align-items: start;
`;

const TransactionDetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: all 0.3s ease;
`;

const TransactionDetailLabel = styled.span`
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const TransactionDetailValue = styled.span`
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.15);
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    word-break: break-word;
    line-height: 1.4;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    
    &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.35);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;

// ================================================================= TAG MODAL COMPONENT

const TagModal = ({ isOpen, onClose, transaction, onTagsUpdated, onTagSelect, selectedTags: externalSelectedTags, availableTags: externalAvailableTags }) => {
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagName, setNewTagName] = useState('');
    const [newTagEmoji, setNewTagEmoji] = useState('🏷️');
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [newTagColor, setNewTagColor] = useState('#f59e0b');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);
    const [tagTransactionCount, setTagTransactionCount] = useState(0);

    // Color options for tags in rainbow order
    const colorOptions = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4',
        '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#be185d', '#dc2626',
        '#65a30d', '#059669', '#0891b2', '#047857', '#7c3aed', '#6366f1'
    ];

    // Emoji categories and options
    const emojiCategories = {
        'Common': ['🏷️', '📝', '⭐', '💡', '🎯', '📌', '🔖', '🏆'],
        'Food & Drink': ['🍕', '🍔', '🍜', '🍣', '🍰', '☕', '🍺', '🍷'],
        'Travel': ['✈️', '🚗', '🚲', '🚢', '🏨', '🗺️', '🎒', '📷'],
        'Shopping': ['🛍️', '🛒', '💳', '💰', '🎁', '📦', '🛍️', '🏪'],
        'Activities': ['🎬', '🎮', '🎨', '🎵', '🏃', '🧘', '🎯', '🎪'],
        'Work & Business': ['💼', '💻', '📊', '📈', '🏢', '🤝', '📞', '📧'],
        'Home & Life': ['🏠', '🏡', '🔧', '⚡', '🚿', '🛏️', '🍳', '🧹'],
        'Health & Wellness': ['🏥', '💊', '🧘', '🏃', '🥗', '💪', '🧘', '🩺']
    };

    // Determine if this is for manual transaction creation
    const isManualCreation = !transaction && externalSelectedTags !== undefined;

    useEffect(() => {
        if (isOpen) {
            if (isManualCreation) {
                // For manual creation, use external props
                setAvailableTags(externalAvailableTags || []);
                setSelectedTags(externalSelectedTags || []);
            } else {
                // For existing transaction, load tags normally
            loadTags();
            if (transaction?.tags && Array.isArray(transaction.tags)) {
                setSelectedTags(transaction.tags);
            } else {
                setSelectedTags([]);
            }
        }
        }
    }, [isOpen, transaction, isManualCreation, externalSelectedTags, externalAvailableTags]);



    const loadTags = async () => {
        try {
            const response = await getTags();
            const tags = Array.isArray(response) ? response : [];
            console.log('Loaded tags:', tags);
            
            if (tags.length === 0) {
                // No tags exist, initialize default tags
                await initializeDefaultTagsIfNeeded();
            } else {
                setAvailableTags(tags);
            }
        } catch (error) {
            console.error('Error loading tags:', error);
            toast.error('Failed to load tags');
            setAvailableTags([]);
        }
    };

    const initializeDefaultTagsIfNeeded = async () => {
        try {
            setIsInitializing(true);
            await initializeDefaultTags();
            
            // Reload tags after initialization
            const response = await getTags();
            const tags = Array.isArray(response) ? response : [];
            setAvailableTags(tags);
        } catch (error) {
            console.error('Error initializing default tags:', error);
            toast.error('Failed to initialize default tags');
        } finally {
            setIsInitializing(false);
        }
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        setIsCreatingTag(true);
        try {
            const newTag = await createTag({
                name: newTagName.trim(),
                emoji: newTagEmoji,
                color: newTagColor
            });
            
            setAvailableTags(Array.isArray(availableTags) ? [...availableTags, newTag] : [newTag]);
            setNewTagName('');
            setNewTagEmoji('🏷️');
            toast.success(`Tag "${newTag.name}" created successfully!`);
        } catch (error) {
            console.error('Error creating tag:', error);
            toast.error('Failed to create tag');
        } finally {
            setIsCreatingTag(false);
        }
    };

    const handleAddTag = (tag) => {
        if (isManualCreation && onTagSelect) {
            // For manual creation, call the external handler
            onTagSelect(tag);
        } else {
            // For existing transaction, update local state
        if (!Array.isArray(selectedTags)) {
            setSelectedTags([tag]);
        } else if (!selectedTags.find(t => t.id === tag.id)) {
            setSelectedTags([...selectedTags, tag]);
            }
        }
    };

    const handleRemoveTag = (tagId) => {
        if (isManualCreation && onTagSelect) {
            // For manual creation, we need to handle removal differently
            // This will be handled by the parent component
        } else {
            // For existing transaction, update local state
        if (Array.isArray(selectedTags)) {
            setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
            }
        }
    };

    const handleEmojiSelect = (emoji) => {
        setNewTagEmoji(emoji);
        setShowEmojiPicker(false);
    };

    const handleEmojiButtonClick = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setShowEmojiPicker(!showEmojiPicker);
        }
    };

    const handleColorSelect = (color) => {
        setNewTagColor(color);
        setShowColorPicker(false);
    };

    const handleColorButtonClick = () => {
        setShowColorPicker(!showColorPicker);
    };

    const handleDeleteTag = async (tag) => {
        try {
            // Get transaction count for this tag
            const countData = await getTagTransactionCount(tag.id);
            setTagTransactionCount(countData.transaction_count || 0);
        setTagToDelete(tag);
        setShowDeleteConfirmation(true);
        } catch (error) {
            console.error('Error fetching tag transaction count:', error);
            // If we can't get the count, still allow deletion but show 0
            setTagTransactionCount(0);
            setTagToDelete(tag);
            setShowDeleteConfirmation(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!tagToDelete) return;

        try {
            const result = await deleteTag(tagToDelete.id);
            setAvailableTags(availableTags.filter(tag => tag.id !== tagToDelete.id));
            setSelectedTags(selectedTags.filter(tag => tag.id !== tagToDelete.id));
            
            // Show success message with transaction count
            const affectedCount = result.transactions_affected || 0;
            if (affectedCount > 0) {
                toast.success(`Tag "${tagToDelete.name}" deleted successfully! Removed from ${affectedCount} transaction${affectedCount === 1 ? '' : 's'}.`);
            } else {
            toast.success(`Tag "${tagToDelete.name}" deleted successfully!`);
            }
            
            // Immediately refresh transactions to reflect the changes
            if (onTagsUpdated) {
                onTagsUpdated();
            }
            
            // Also update the current transaction's tags if it had the deleted tag
            if (transaction && Array.isArray(transaction.tags)) {
                const updatedTransactionTags = transaction.tags.filter(tag => tag.id !== tagToDelete.id);
                // Update the transaction object to reflect the change immediately
                transaction.tags = updatedTransactionTags;
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error('Failed to delete tag');
        } finally {
            setShowDeleteConfirmation(false);
            setTagToDelete(null);
            setTagTransactionCount(0);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
        setTagToDelete(null);
        setTagTransactionCount(0);
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
                setShowEmojiPicker(false);
            }
            if (showColorPicker && !event.target.closest('.color-picker-container')) {
                setShowColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker, showColorPicker]);

    const handleSave = async () => {
        if (isManualCreation) {
            // For manual creation, just close the modal
            onClose();
            return;
        }

        if (!transaction) return;

        setIsLoading(true);
        try {
            // Get current transaction tags
            const currentTags = Array.isArray(transaction.tags) ? transaction.tags : [];
            const currentTagIds = currentTags.map(tag => tag.id);
            const selectedTagIds = Array.isArray(selectedTags) ? selectedTags.map(tag => tag.id) : [];

            // Remove tags that are no longer selected
            for (const tagId of currentTagIds) {
                if (!selectedTagIds.includes(tagId)) {
                    await removeTagFromTransaction(transaction.id, tagId);
                }
            }

            // Add new tags
            for (const tagId of selectedTagIds) {
                if (!currentTagIds.includes(tagId)) {
                    await addTagToTransaction(transaction.id, tagId);
                }
            }

            toast.success('Tags updated successfully!');
            onTagsUpdated && onTagsUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating tags:', error);
            toast.error('Failed to update tags');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle modal close - ensure any tag deletions are applied immediately
    const handleModalClose = () => {
        // If there are any tags that were deleted during this session, 
        // we need to ensure the transactions are refreshed
        if (onTagsUpdated) {
            onTagsUpdated();
        }
        onClose();
    };

    // Format transaction details for display
    const formatTransactionDetails = () => {
        if (!transaction) return null;
        
        const date = new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return {
            date,
            vendor: transaction.vendor || 'Unknown Vendor',
            description: transaction.description || 'No description'
        };
    };

    if (!isOpen) return null;

    return (
        <Fragment>
            <Modal onClick={handleModalClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <HeaderContent>
                        <WelcomeIcon>
                            <FontAwesomeIcon icon={faTags} />
                        </WelcomeIcon>
                        <HeaderText>
                            <ModalTitle>{isManualCreation ? 'Select Tags' : 'Manage Transaction Tags'}</ModalTitle>
                            <ModalSubtitle>{isManualCreation ? 'Choose tags for your new transaction' : 'Organize and categorize your transactions'}</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={handleModalClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </CloseButton>
                </ModalHeader>

                {/* Transaction Details Section */}
                {transaction && !isManualCreation && (
                    <TransactionDetailsSection>
                        <TransactionDetailsHeader>
                            <FontAwesomeIcon icon={faHandshake} style={{ marginRight: '0.5rem', opacity: 0.7 }} />
                            Transaction Details
                        </TransactionDetailsHeader>
                        <TransactionDetailsContent>
                            {(() => {
                                const details = formatTransactionDetails();
                                if (!details) return null;
                                
                                return (
                                    <TransactionDetailsRow>
                                        <TransactionDetailItem>
                                            <TransactionDetailLabel>
                                                📅 Date
                                            </TransactionDetailLabel>
                                            <TransactionDetailValue>{details.date}</TransactionDetailValue>
                                        </TransactionDetailItem>
                                        <TransactionDetailItem>
                                            <TransactionDetailLabel>
                                                🏪 Vendor
                                            </TransactionDetailLabel>
                                            <TransactionDetailValue>{details.vendor}</TransactionDetailValue>
                                        </TransactionDetailItem>
                                        <TransactionDetailItem>
                                            <TransactionDetailLabel>
                                                📝 Description
                                            </TransactionDetailLabel>
                                            <TransactionDetailValue>{details.description}</TransactionDetailValue>
                                        </TransactionDetailItem>
                                    </TransactionDetailsRow>
                                );
                            })()}
                        </TransactionDetailsContent>
                    </TransactionDetailsSection>
                )}

                <ModalBody>
                    {/* Current Tags */}
                    <div>
                        <SectionTitle>
                            Current Tags
                        </SectionTitle>
                        <TagsContainer>
                            {Array.isArray(selectedTags) && selectedTags.length === 0 ? (
                                <EmptyState>
                                    <FontAwesomeIcon icon={faTags} style={{ fontSize: '1.5rem', opacity: 0.5 }} />
                                    <span>No tags selected</span>
                                </EmptyState>
                            ) : (
                                Array.isArray(selectedTags) && selectedTags.map(tag => (
                                    <TagPill key={tag.id} color={tag.color}>
                                        <span>{tag.emoji}</span>
                                        <span>{tag.name}</span>
                                        <RemoveTagButton onClick={() => handleRemoveTag(tag.id)}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </RemoveTagButton>
                                    </TagPill>
                                ))
                            )}
                        </TagsContainer>
                    </div>
                    <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '10px' }} />
                    {/* Available Tags */}
                    <div>
                        <SectionTitle>
                            Available Tags
                        </SectionTitle>
                        <AvailableTagsContainer>
                            {isInitializing ? (
                                <EmptyState>
                                    <FontAwesomeIcon icon={faTags} spin style={{ fontSize: '1.5rem' }} />
                                    <span>Initializing default tags...</span>
                                </EmptyState>
                            ) : Array.isArray(availableTags) && availableTags.length > 0 ? (
                                availableTags.map(tag => (
                                    <div key={tag.id} style={{ position: 'relative', display: 'inline-block' }}>
                                        <AvailableTag
                                            color={tag.color}
                                            $isSelected={selectedTags.find(t => t.id === tag.id)}
                                            onClick={() => handleAddTag(tag)}
                                        >
                                            <span>{tag.emoji}</span>
                                            <span>{tag.name}</span>
                                        </AvailableTag>
                                        {!tag.is_default && (
                                            <DeleteButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTag(tag);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    top: '-5px',
                                                    right: '-5px',
                                                    width: '20px',
                                                    height: '20px',
                                                    padding: '0',
                                                    borderRadius: '50%',
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                            </DeleteButton>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <EmptyState>
                                    <FontAwesomeIcon icon={faTags} style={{ fontSize: '1.5rem', opacity: 0.5 }} />
                                    <span>No tags available. Create your first tag below!</span>
                                </EmptyState>
                            )}
                        </AvailableTagsContainer>
                    </div>

                    <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '10px' }} />
                    {/* Create New Tag */}
                    <CreateTagSection>
                        <SectionTitle>
                            Create New Tag
                        </SectionTitle>
                        <CreateTagForm onSubmit={handleCreateTag}>
                            <InputGroup>
                                <InputLabel>Emoji</InputLabel>
                                <EmojiInput className="emoji-picker-container">
                                    <EmojiButton
                                        type="button"
                                        onClick={handleEmojiButtonClick}
                                        onKeyDown={handleEmojiKeyDown}
                                        aria-label="Select emoji"
                                        aria-expanded={showEmojiPicker}
                                    >
                                        {newTagEmoji}
                                    </EmojiButton>
                                    {showEmojiPicker && (
                                        <EmojiPicker>
                                            {Object.entries(emojiCategories).map(([category, emojis]) => (
                                                <EmojiCategory key={category}>
                                                    <CategoryTitle>{category}</CategoryTitle>
                                                    <EmojiGrid>
                                                        {emojis.map((emoji, index) => (
                                                            <EmojiOption
                                                                key={`${category}-${index}`}
                                                                onClick={() => handleEmojiSelect(emoji)}
                                                                title={emoji}
                                                            >
                                                                {emoji}
                                                            </EmojiOption>
                                                        ))}
                                                    </EmojiGrid>
                                                </EmojiCategory>
                                            ))}
                                        </EmojiPicker>
                                    )}
                                </EmojiInput>
                            </InputGroup>
                            <InputGroup>
                                <InputLabel>Tag Name</InputLabel>
                                <FormInput
                                    type="text"
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="Enter tag name"
                                    required
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputLabel>Color</InputLabel>
                                <div className="color-picker-container" style={{ position: 'relative', width: '100%', height: '48px' }}>
                                    <ColorButton
                                        type="button"
                                        color={newTagColor}
                                        onClick={handleColorButtonClick}
                                        aria-label="Select color"
                                    >
                                    </ColorButton>
                                    {showColorPicker && (
                                        <ColorPicker>
                                            <ColorGrid>
                                                {colorOptions.map((color, index) => (
                                                    <ColorOption
                                                        key={index}
                                                        color={color}
                                                        $isSelected={color === newTagColor}
                                                        onClick={() => handleColorSelect(color)}
                                                        title={color}
                                                    >
                                                        {color === newTagColor && (
                                                            <FontAwesomeIcon icon={faCheck} style={{ color: 'white', fontSize: '0.8rem' }} />
                                                        )}
                                                    </ColorOption>
                                                ))}
                                            </ColorGrid>
                                        </ColorPicker>
                                    )}
                                </div>
                            </InputGroup>
                            <CreateButton type="submit" disabled={isCreatingTag || !newTagName.trim()}>
                                <FontAwesomeIcon icon={faPlus} />
                                {isCreatingTag ? 'Creating...' : 'Create'}
                            </CreateButton>
                        </CreateTagForm>
                    </CreateTagSection>

                    <ActionButtons>
                        <CancelButton onClick={handleModalClose}>
                            Cancel
                        </CancelButton>
                        {isManualCreation ? (
                            <SaveButton onClick={handleSave}>
                                <FontAwesomeIcon icon={faCheck} />
                                Done
                            </SaveButton>
                        ) : (
                        <SaveButton onClick={handleSave} disabled={isLoading}>
                            <FontAwesomeIcon icon={faStar} />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </SaveButton>
                        )}
                    </ActionButtons>
                </ModalBody>
            </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
            <ConfirmationModal onClick={handleCancelDelete}>
                <ConfirmationContent onClick={(e) => e.stopPropagation()}>
                    <ConfirmationTitle>
                        <FontAwesomeIcon icon={faTrash} style={{ marginRight: '0.5rem' }} />
                        Delete Tag
                    </ConfirmationTitle>
                    <ConfirmationMessage>
                        Are you sure you want to delete the tag "{tagToDelete?.name}"? 
                    </ConfirmationMessage>
                    <ConfirmationMessage>
                        This action cannot be undone and will remove the tag from all transactions.
                    </ConfirmationMessage>
                    {tagTransactionCount > 0 && (
                        <ConfirmationMessage style={{ color: '#ef4444', fontWeight: '600' }}>
                            ⚠️ This tag is currently associated with {tagTransactionCount} transaction{tagTransactionCount === 1 ? '' : 's'}.
                        </ConfirmationMessage>
                    )}
                    <ConfirmationButtons>
                        <CancelConfirmButton onClick={handleCancelDelete}>
                            Cancel
                        </CancelConfirmButton>
                        <ConfirmButton onClick={handleConfirmDelete}>
                            Delete Tag
                        </ConfirmButton>
                    </ConfirmationButtons>
                </ConfirmationContent>
            </ConfirmationModal>
        )}
        </Fragment>
    );
};

export default TagModal; 