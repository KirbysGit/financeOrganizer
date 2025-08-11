// Imports.
import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faChevronLeft, faChevronRight, faXmark, faFilter, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

// Local Imports.
import '../../../styles/colors.css';

// -------------------------------------------------------- DateFilter Component.
const DateFilter = ({ isOpen, onClose, onApplyFilter, currentFilter }) => {
    const [selectedDate, setSelectedDate] = useState(currentFilter?.date || null);
    const [startDate, setStartDate] = useState(currentFilter?.startDate || null);
    const [endDate, setEndDate] = useState(currentFilter?.endDate || null);
    const [currentView, setCurrentView] = useState('month'); // 'day', 'week', 'month', 'year'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState(null);
    const [isRangeMode, setIsRangeMode] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    // -------------------------------------------------------- Calculate Dropdown Position.
    useEffect(() => {
        if (isOpen) {
            const button = document.querySelector('.date-filter-wrapper button');
            if (button) {
                const rect = button.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left
                });
            }
        }
    }, [isOpen]);

    // -------------------------------------------------------- Generate Calendar Days.
    const generateCalendarDays = (year, month) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= lastDay || currentDate.getDay() !== 0) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return days;
    };

    // -------------------------------------------------------- Generate Year View.
    const generateYearView = (year) => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            months.push(new Date(year, i, 1));
        }
        return months;
    };

    // -------------------------------------------------------- Handle Date Selection.
    const handleDateClick = (date) => {
        if (isRangeMode) {
            if (!startDate || (startDate && endDate)) {
                setStartDate(date);
                setEndDate(null);
            } else {
                if (date >= startDate) {
                    setEndDate(date);
                } else {
                    setStartDate(date);
                    setEndDate(startDate);
                }
            }
        } else {
            setSelectedDate(date);
            setStartDate(null);
            setEndDate(null);
        }
    };

    // -------------------------------------------------------- Handle Month Selection.
    const handleMonthClick = (month) => {
        if (isRangeMode) {
            const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
            const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            
            if (!startDate || (startDate && endDate)) {
                setStartDate(startOfMonth);
                setEndDate(null);
            } else {
                if (startOfMonth >= startDate) {
                    setEndDate(endOfMonth);
                } else {
                    setStartDate(startOfMonth);
                    setEndDate(startDate);
                }
            }
        } else {
            // For single mode, select the entire month
            const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
            const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            setStartDate(startOfMonth);
            setEndDate(endOfMonth);
            setSelectedDate(null); // Clear single date since we're using range internally
        }
    };

    // -------------------------------------------------------- Apply Filter.
    const handleApplyFilter = () => {
        let filterData = null;
        
        if (isRangeMode && startDate && endDate) {
            filterData = { mode: 'range', startDate, endDate };
        } else if (!isRangeMode && selectedDate) {
            filterData = { mode: 'single', date: selectedDate };
        } else if (!isRangeMode && startDate && endDate) {
            // Handle single month selection (which uses range internally)
            filterData = { mode: 'range', startDate, endDate };
        }
        
        onApplyFilter(filterData);
        onClose();
    };

    // -------------------------------------------------------- Clear Filter.
    const handleClearFilter = () => {
        setSelectedDate(null);
        setStartDate(null);
        setEndDate(null);
        onApplyFilter(null);
        onClose();
    };

    // -------------------------------------------------------- Check If Date Is Selected.
    const isDateSelected = (date) => {
        if (isRangeMode) {
            if (!startDate) return false;
            if (!endDate) return date.toDateString() === startDate.toDateString();
            return date >= startDate && date <= endDate;
        } else {
            if (selectedDate) {
                return date.toDateString() === selectedDate.toDateString();
            } else if (startDate && endDate) {
                // Handle single month selection (which uses range internally)
                return date >= startDate && date <= endDate;
            }
            return false;
        }
    };

    // -------------------------------------------------------- Check If Date Is In Range.
    const isDateInRange = (date) => {
        if (!isRangeMode || !startDate || !endDate) return false;
        return date >= startDate && date <= endDate;
    };

    // -------------------------------------------------------- Check If Date Is Start/End.
    const isDateStartOrEnd = (date) => {
        if (!isRangeMode) return false;
        return (startDate && date.toDateString() === startDate.toDateString()) ||
               (endDate && date.toDateString() === endDate.toDateString());
    };

    // -------------------------------------------------------- Navigate Date.
    const navigateDate = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (currentView === 'year') {
                newDate.setFullYear(newDate.getFullYear() + direction);
            } else {
                newDate.setMonth(newDate.getMonth() + direction);
            }
            return newDate;
        });
    };

    // -------------------------------------------------------- Get View Title.
    const getViewTitle = () => {
        if (currentView === 'year') {
            return currentDate.getFullYear().toString();
        } else {
            return currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
    };

    // -------------------------------------------------------- Toggle Range Mode.
    const toggleRangeMode = () => {
        setIsRangeMode(!isRangeMode);
        if (!isRangeMode) {
            // Switching to range mode, clear single date
            setSelectedDate(null);
        } else {
            // Switching to single mode, clear range
            setStartDate(null);
            setEndDate(null);
        }
    };

    // -------------------------------------------------------- Get Selection Status.
    const getSelectionStatus = () => {
        if (isRangeMode) {
            if (startDate && endDate) {
                if (currentView === 'year') {
                    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    return `${startMonth} - ${endMonth}`;
                } else {
                    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return `${startStr} - ${endStr}`;
                }
            } else if (startDate) {
                if (currentView === 'year') {
                    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    return `${startMonth} - Select end`;
                } else {
                    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return `${startStr} - Select end`;
                }
            } else {
                return 'Select start date';
            }
        } else {
            if (selectedDate) {
                if (currentView === 'year') {
                    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                } else {
                    return selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                }
            } else if (startDate && endDate) {
                // Handle single month selection (which uses range internally)
                if (currentView === 'year') {
                    const startMonth = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return `${startMonth}`;
                } else {
                    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return `${startStr} - ${endStr}`;
                }
            } else {
                return 'Select a date';
            }
        }
    };

    if (!isOpen) return null;

    return (
        <DateFilterDropdown 
            className="date-filter-dropdown"
            onClick={(e) => e.stopPropagation()}
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
            }}
        >
            <FilterControls>
                <RangeToggle 
                    $isActive={isRangeMode}
                    onClick={toggleRangeMode}
                    title="Click to toggle between Single and Range mode"
                >
                    <FontAwesomeIcon icon={isRangeMode ? faExpand : faCompress} />
                    {isRangeMode ? 'Range' : 'Single'}
                    <TogglePill $isRange={isRangeMode}>
                        <ToggleLabel $isActive={!isRangeMode} style={{ marginLeft: '1px' }}>S</ToggleLabel>
                        <ToggleLabel $isActive={isRangeMode} style={{ marginRight: '1.5px' }}>R</ToggleLabel>
                    </TogglePill>
                </RangeToggle>
                
                <ViewToggle 
                    $isActive={currentView === 'month'}
                    onClick={() => setCurrentView('month')}
                >
                    Month
                </ViewToggle>
                <ViewToggle 
                    $isActive={currentView === 'year'}
                    onClick={() => setCurrentView('year')}
                >
                    Year
                </ViewToggle>
            </FilterControls>

            <CalendarSection>
                <CalendarHeader>
                    <CalendarNavButton onClick={() => navigateDate(-1)}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </CalendarNavButton>
                    <CalendarTitle>
                        {getViewTitle()}
                    </CalendarTitle>
                    <CalendarNavButton onClick={() => navigateDate(1)}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </CalendarNavButton>
                </CalendarHeader>

                <SelectionStatus>
                    {getSelectionStatus()}
                </SelectionStatus>

                {currentView === 'year' ? (
                    <YearGrid>
                        {generateYearView(currentDate.getFullYear()).map((month, index) => {
                            const isSelected = isDateSelected(month);
                            const isInRange = isDateInRange(month);
                            
                            return (
                                <MonthButton
                                    style={{ font: 'inherit', fontSize: '0.8rem' }}
                                    key={index}
                                    $isSelected={isSelected}
                                    $isInRange={isInRange}
                                    onClick={() => handleMonthClick(month)}
                                >
                                    {month.toLocaleDateString('en-US', { month: 'short' })}
                                </MonthButton>
                            );
                        })}
                    </YearGrid>
                ) : (
                    <CalendarGrid>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                            <CalendarDayHeader key={day}>{day}</CalendarDayHeader>
                        ))}
                        
                        {generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth()).map((date, index) => {
                            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                            const isSelected = isDateSelected(date);
                            const isInRange = isDateInRange(date);
                            const isStartOrEnd = isDateStartOrEnd(date);
                            
                            return (
                                <CalendarDay
                                    style={{ font: 'inherit', fontSize: '0.8rem' }}
                                    key={index}
                                    $isCurrentMonth={isCurrentMonth}
                                    $isSelected={isSelected}
                                    $isInRange={isInRange}
                                    $isStartOrEnd={isStartOrEnd}
                                    onClick={() => handleDateClick(date)}
                                    onMouseEnter={() => setHoveredDate(date)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                >
                                    {date.getDate()}
                                </CalendarDay>
                            );
                        })}
                    </CalendarGrid>
                )}
            </CalendarSection>

            <DateFilterActions>
                <ClearButton onClick={handleClearFilter}>
                    Clear
                </ClearButton>
                <ApplyButton onClick={handleApplyFilter}>
                    Apply
                </ApplyButton>
            </DateFilterActions>
        </DateFilterDropdown>
    );
};

// -------------------------------------------------------- Styled Components.

// -------------------------------------------------------- DateFilterDropdown.
const DateFilterDropdown = styled.div`
    min-width: 320px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.2s ease-out;
    overflow: hidden;
    max-height: 500px;

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

// -------------------------------------------------------- FilterControls.
const FilterControls = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 0;
    padding: 0;
    border-bottom: 1px solid #eee;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    border-radius: 0;
`;

// -------------------------------------------------------- RangeToggle.
const RangeToggle = styled.button`
    font: inherit;
    flex: 1;
    background: transparent;
    color: ${props => props.$isActive ? 'white' : 'rgba(255, 255, 255, 0.8)'};
    padding: 0.75rem 0.5rem;
    border: none;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    position: relative;
    overflow: visible;
    min-height: 40px;

    &:hover {
        background: ${props => props.$isActive 
            ? 'rgba(255, 255, 255, 0.30)' 
            : 'rgba(255, 255, 255, 0.1)'
        };
        color: white;
    }

    &:active {
        transform: scale(0.98);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.3s;
    }
    
    &:hover::before {
        left: 100%;
    }
`;

// -------------------------------------------------------- ViewToggle.
const ViewToggle = styled.button`
    font: inherit;
    flex: 1;
    background: ${props => props.$isActive 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'transparent'
    };
    color: ${props => props.$isActive ? 'white' : 'rgba(255, 255, 255, 0.8)'};
    border: none;
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    position: relative;
    overflow: hidden;

    &:hover {
        background: ${props => props.$isActive 
            ? 'rgba(255, 255, 255, 0.25)' 
            : 'rgba(255, 255, 255, 0.1)'
        };
        color: white;
    }

    &:active {
        transform: scale(0.98);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.3s;
    }
    
    &:hover::before {
        left: 100%;
    }
`;

// -------------------------------------------------------- CalendarSection.
const CalendarSection = styled.div`
    padding: 1rem;
`;

// -------------------------------------------------------- CalendarHeader.
const CalendarHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
`;

// -------------------------------------------------------- CalendarNavButton.
const CalendarNavButton = styled.button`
    background: none;
    border: none;
    font-size: 1rem;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    transition: background 0.2s ease;

    &:hover {
        background: rgba(100, 100, 100, 0.08);
    }
`;

// -------------------------------------------------------- CalendarTitle.
const CalendarTitle = styled.h4`
    margin: 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
`;

// -------------------------------------------------------- SelectionStatus.
const SelectionStatus = styled.div`
    padding: 0.5rem;
    margin-bottom: 1rem;
    background: rgba(0, 123, 255, 0.2);
    border: 1px solid rgba(0, 123, 255, 0.1);
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
    text-align: center;
`;

// -------------------------------------------------------- TogglePill.
const TogglePill = styled.div`
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 12px;
    background: rgba(255, 255, 255, 0.3);
    border: none;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
    overflow: hidden;
    
    &::after {
        content: '';
        position: absolute;
        top: 1px;
        left: ${props => props.$isRange ? '13px' : '1px'};
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transition: left 0.3s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
`;

// -------------------------------------------------------- ToggleLabel.
const ToggleLabel = styled.span`
    font-size: 0.5rem;
    font-weight: bold;
    color: ${props => props.$isActive ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.6)'};
    z-index: 1;
    transition: color 0.3s ease;
`;

// -------------------------------------------------------- CalendarGrid.
const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
`;

// -------------------------------------------------------- CalendarDayHeader.
const CalendarDayHeader = styled.div`
    font-size: 0.7rem;
    color: #999;
    text-align: center;
    padding: 0.25rem;
    font-weight: 500;
`;

// -------------------------------------------------------- CalendarDay.
const CalendarDay = styled.button`
    background: none;
    border: none;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    text-align: center;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    ${props => props.$isCurrentMonth && `
        color: var(--text-primary);
    `}

    ${props => props.$isSelected && `
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        border-color: transparent;
    `}

    ${props => props.$isInRange && `
        background: rgba(0, 123, 255, 0.75);
        border: 1.5px solid rgba(0, 123, 255, 0.5);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.12);
    `}
    ${props => props.$isStartOrEnd && `
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        border: 2px solid var(--button-primary);
        z-index: 2;
    `}

    &:hover {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        z-index: 2;
    }

    &:active {
        transform: scale(0.95);
    }
`;

// -------------------------------------------------------- YearGrid.
const YearGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
`;

// -------------------------------------------------------- MonthButton.
const MonthButton = styled.button`
    background: none;
    border: none;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.5rem 0.25rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 1px solid transparent;

    ${props => props.$isSelected && `
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        border-color: transparent;
        z-index: 2;
    `}

    ${props => props.$isInRange && `
        background: rgba(0, 123, 255, 0.75);
        border: 1.5px solid rgba(0, 123, 255, 0.5);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.12);
    `}

    &:hover {
        background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
        color: white;
        z-index: 2;
    }
`;

// -------------------------------------------------------- DateFilterActions.
const DateFilterActions = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-top: 1px solid #eee;
    background: #f9f9f9;
    gap: 0.25rem;
`;

// -------------------------------------------------------- ClearButton.
const ClearButton = styled.button`
    font: inherit;
    flex: 1;
    background: none;
    border: 1px solid #ddd;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.4rem 0.5rem;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
        background:rgb(0, 0, 0, 0.1);
        border-color: #ccc;
    }
`;

// -------------------------------------------------------- ApplyButton.
const ApplyButton = styled.button`
    font: inherit;
    flex: 1;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    border: none;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.4rem 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &:active {
        transform: translateY(0);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

// -------------------------------------------------------- Export The DateFilter Component.
export default DateFilter;
