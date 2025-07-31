import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faFilter, faTags } from '@fortawesome/free-solid-svg-icons';
import { getTags } from '../../../services/api';

// Local Imports.
import '../../../styles/colors.css';

const TagFilter = ({ 
    isOpen, 
    onClose, 
    onApplyFilter, 
    currentFilter = null 
}) => {
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState(
        currentFilter?.tagIds || []
    );
    const [isLoading, setIsLoading] = useState(false);

    // Load available tags when component mounts
    useEffect(() => {
        if (isOpen) {
            loadTags();
        }
    }, [isOpen]);

    // Reset when currentFilter changes
    useEffect(() => {
        if (currentFilter) {
            setSelectedTags(currentFilter.tagIds || []);
        } else {
            setSelectedTags([]);
        }
    }, [currentFilter]);

    const loadTags = async () => {
        setIsLoading(true);
        try {
            const tags = await getTags();
            setAvailableTags(Array.isArray(tags) ? tags : []);
        } catch (error) {
            console.error('Error loading tags:', error);
            setAvailableTags([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTagToggle = (tagId) => {
        setSelectedTags(prev => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleSelectAll = () => {
        setSelectedTags(availableTags.map(tag => tag.id));
    };

    const handleDeselectAll = () => {
        setSelectedTags([]);
    };

    const handleApply = () => {
        const filterData = {
            tagIds: selectedTags,
            hasFilter: selectedTags.length > 0
        };
        onApplyFilter(filterData);
        onClose();
    };

    const handleClear = () => {
        setSelectedTags([]);
        onApplyFilter(null);
        onClose();
    };

    const getStatusText = () => {
        if (selectedTags.length === 0) return "All Tags";
        if (selectedTags.length === 1) {
            const tag = availableTags.find(t => t.id === selectedTags[0]);
            return tag ? tag.name : "1 Tag";
        }
        return `${selectedTags.length} Tags`;
    };

    if (!isOpen) return null;

    return (
        <FilterContainer>
            <FilterControls />

            {/* Tag Selection Section */}
            <TagSelectionSection>
                <TagSelectionHeader>
                    <TagSelectionTitle>Select Tags</TagSelectionTitle>
                    <TagSelectionActions>
                        <ActionButton onClick={handleSelectAll}>
                            Select All
                        </ActionButton>
                        <ActionButton onClick={handleDeselectAll}>
                            Clear All
                        </ActionButton>
                    </TagSelectionActions>
                </TagSelectionHeader>

                {isLoading ? (
                    <LoadingContainer>
                        <LoadingText>Loading tags...</LoadingText>
                    </LoadingContainer>
                ) : availableTags.length === 0 ? (
                    <EmptyContainer>
                        <EmptyIcon>
                            <FontAwesomeIcon icon={faTags} />
                        </EmptyIcon>
                        <EmptyText>No tags available</EmptyText>
                        <EmptySubtext>Create some tags to filter transactions</EmptySubtext>
                    </EmptyContainer>
                ) : (
                    <TagGrid>
                        {availableTags.map((tag) => (
                            <TagCheckbox 
                                key={tag.id}
                                $isSelected={selectedTags.includes(tag.id)}
                                $tagColor={tag.color}
                                onClick={() => handleTagToggle(tag.id)}
                            >
                                <CheckboxIcon>
                                    {selectedTags.includes(tag.id) && (
                                        <FontAwesomeIcon icon={faCheck} />
                                    )}
                                </CheckboxIcon>
                                <TagLabel>
                                    <span className="emoji">{tag.emoji}</span>
                                    <span className="name">{tag.name}</span>
                                </TagLabel>
                            </TagCheckbox>
                        ))}
                    </TagGrid>
                )}
            </TagSelectionSection>

            {/* Status Display */}
            <StatusDisplay>
                <StatusLabel>Current Selection</StatusLabel>
                <StatusValue>{getStatusText()}</StatusValue>
            </StatusDisplay>

            {/* Action Buttons */}
            <ActionButtons>
                <ClearButton onClick={handleClear}>
                    Clear Filter
                </ClearButton>
                <ApplyButton onClick={handleApply}>
                    Apply Filter
                </ApplyButton>
            </ActionButtons>
        </FilterContainer>
    );
};

// Styled Components
const FilterContainer = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    padding: 0;
    min-width: 350px;
    max-width: 450px;
    animation: slideIn 0.2s ease-out;
    overflow: hidden;

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const FilterControls = styled.div`
    height: 10px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
`;

const TagSelectionSection = styled.div`
    margin-bottom: 1rem;
    padding: 0 1.25rem;
`;

const TagSelectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 1.25rem 0 0 0;
`;

const TagSelectionTitle = styled.h4`
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
`;

const TagSelectionActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button`
    font: inherit;
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    color: var(--text-primary);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--button-primary);
        background: #f8f9fa;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    color: var(--text-secondary);
`;

const LoadingText = styled.div`
    font-size: 0.9rem;
    font-weight: 500;
`;

const EmptyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
`;

const EmptyIcon = styled.div`
    font-size: 2rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    opacity: 0.7;
`;

const EmptyText = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.div`
    font-size: 0.85rem;
    color: var(--text-secondary);
`;

const TagGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 0.5rem;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
`;

const TagCheckbox = styled.button`
    font: inherit;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 2px solid ${props => props.$isSelected ? props.$tagColor || 'var(--button-primary)' : '#e0e0e0'};
    border-radius: 8px;
    background: ${props => props.$isSelected ? props.$tagColor || 'linear-gradient(135deg, var(--button-primary), var(--amount-positive))' : 'white'};
    color: ${props => props.$isSelected ? 'white' : 'var(--text-primary)'};
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    width: 100%;

    &:hover {
        border-color: ${props => props.$tagColor || 'var(--button-primary)'};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
`;

const CheckboxIcon = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    flex-shrink: 0;
`;

const TagLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .emoji {
        font-size: 1rem;
    }

    .name {
        font-weight: 500;
        font-size: 0.85rem;
    }
`;

const StatusDisplay = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin: 0 1.25rem 1rem 1.25rem;
`;

const StatusLabel = styled.span`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const StatusValue = styled.span`
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 600;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding: 0 1.25rem 1.25rem 1.25rem;
`;

const ClearButton = styled.button`
    font: inherit;
    font-size: 0.8rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    background: white;
    color: var(--text-secondary);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #ccc;
        background: #f8f9fa;
    }
`;

const ApplyButton = styled.button`
    font: inherit;
    font-size: 0.8rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-1px);
    }
`;

export default TagFilter; 