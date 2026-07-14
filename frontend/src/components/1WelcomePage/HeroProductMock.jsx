// HeroProductMock.jsx
//
// Simplified Centi "Overview" Dashboard Preview For The Landing Hero.
// Decorative Only — Not Connected To Live Data. Mirrors The Reference Design:
// light sidebar w/ labels, greeting header, 2-card top row (Spending Overview +
// Category Breakdown), 3-card bottom row (Budget vs Actual, Recent Transactions,
// Cash Flow).

// Imports.
import React from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTableColumns,
    faExchangeAlt,
    faWallet,
    faBullseye,
    faChartLine,
    faUniversity,
    faGear,
    faArrowRightFromBracket,
    faBell,
    faChevronDown,
    faCaretUp,
    faHouse,
    faUtensils,
    faBagShopping,
    faCar,
    faFilm,
    faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons';

import '../../styles/colors.css';

// -------------------------------------------------------- Category Data (Donut + Legend).
const CATEGORIES = [
    { label: 'Housing',        pct: 30, amount: '$820.00', color: '#0d6efd', start: 0 },
    { label: 'Food & Dining',  pct: 20, amount: '$547.20', color: '#198754', start: 30 },
    { label: 'Shopping',       pct: 15, amount: '$410.47', color: '#00d4aa', start: 50 },
    { label: 'Transport',      pct: 10, amount: '$273.65', color: '#ffc107', start: 65 },
    { label: 'Entertainment',  pct: 8,  amount: '$218.92', color: '#8b5cf6', start: 75 },
    { label: 'Other',          pct: 17, amount: '$465.24', color: '#adb5bd', start: 83 },
];

// -------------------------------------------------------- HeroProductMock Component.
const HeroProductMock = () => {
    return (
        <MockShell aria-hidden="true">
            <MockGlow />
            <MockWindow>
                {/* Light Sidebar */}
                <MockSidebar>
                    <SidebarBrand>
                        <BrandMark>¢</BrandMark>
                        <BrandName>Centi.</BrandName>
                    </SidebarBrand>
                    <SidebarNav>
                        <NavItem $active><FontAwesomeIcon icon={faTableColumns} /> Overview</NavItem>
                        <NavItem><FontAwesomeIcon icon={faExchangeAlt} /> Transactions</NavItem>
                        <NavItem><FontAwesomeIcon icon={faWallet} /> Budgets</NavItem>
                        <NavItem><FontAwesomeIcon icon={faBullseye} /> Goals</NavItem>
                        <NavItem><FontAwesomeIcon icon={faChartLine} /> Reports</NavItem>
                        <NavItem><FontAwesomeIcon icon={faUniversity} /> Accounts</NavItem>
                        <NavItem><FontAwesomeIcon icon={faGear} /> Settings</NavItem>
                    </SidebarNav>
                    <NavItem $muted><FontAwesomeIcon icon={faArrowRightFromBracket} /> Log out</NavItem>
                </MockSidebar>

                {/* Main Content */}
                <MockMain>
                    {/* Header */}
                    <MockHeader>
                        <div>
                            <MockGreeting>Good morning, Colin 👋</MockGreeting>
                            <MockTitle>Overview</MockTitle>
                        </div>
                        <HeaderActions>
                            <MonthDropdown>
                                This Month <FontAwesomeIcon icon={faChevronDown} />
                            </MonthDropdown>
                            <IconButton><FontAwesomeIcon icon={faBell} /></IconButton>
                            <HeaderAvatar>C</HeaderAvatar>
                        </HeaderActions>
                    </MockHeader>

                    {/* Row 1 */}
                    <TopRow>
                        {/* Spending Overview */}
                        <Card>
                            <CardTitle>Spending Overview</CardTitle>
                            <SpendHead>
                                <SpendValue>$2,736.48</SpendValue>
                                <SpendPeriod>This Month</SpendPeriod>
                                <SpendTrend>
                                    <FontAwesomeIcon icon={faCaretUp} /> 6% vs last month
                                </SpendTrend>
                            </SpendHead>
                            <ChartBody>
                                <YAxis>
                                    <span>$1.2k</span>
                                    <span>$900</span>
                                    <span>$600</span>
                                    <span>$300</span>
                                </YAxis>
                                <ChartPlot>
                                    <LineChartSVG viewBox="0 0 260 96" preserveAspectRatio="none" style={{ width: '100%' }}>
                                        <defs>
                                            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="rgba(13, 110, 253, 0.26)" />
                                                <stop offset="100%" stopColor="rgba(13, 110, 253, 0)" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,72 C24,66 40,78 64,58 C88,38 104,66 128,44 C150,24 168,52 192,40 C214,29 236,20 260,26 L260,96 L0,96 Z"
                                            fill="url(#spendFill)"
                                        />
                                        <path
                                            d="M0,72 C24,66 40,78 64,58 C88,38 104,66 128,44 C150,24 168,52 192,40 C214,29 236,20 260,26"
                                            fill="none"
                                            stroke="var(--button-primary)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    </LineChartSVG>
                                    <XAxis>
                                        <span>May 1</span>
                                        <span>May 8</span>
                                        <span>May 15</span>
                                        <span>May 22</span>
                                        <span>May 28</span>
                                    </XAxis>
                                </ChartPlot>
                            </ChartBody>
                        </Card>

                        {/* Category Breakdown */}
                        <Card>
                            <CardTitle>Category Breakdown</CardTitle>
                            <DonutWrap>
                                <DonutFig>
                                    <DonutSVG viewBox="0 0 42 42">
                                        <circle cx="21" cy="21" r="15.915" fill="none" stroke="#eef2f6" strokeWidth="5" />
                                        {CATEGORIES.map((c) => (
                                            <circle
                                                key={c.label}
                                                cx="21" cy="21" r="15.915"
                                                fill="none"
                                                stroke={c.color}
                                                strokeWidth="5"
                                                pathLength="100"
                                                strokeDasharray={`${c.pct} ${100 - c.pct}`}
                                                strokeDashoffset={-c.start}
                                            />
                                        ))}
                                    </DonutSVG>
                                    <DonutCenter>
                                        <DonutTotal>$2,736.48</DonutTotal>
                                        <DonutCaption>Total Spend</DonutCaption>
                                    </DonutCenter>
                                </DonutFig>
                                <DonutLegend>
                                    {CATEGORIES.map((c) => (
                                        <LegendRow key={c.label}>
                                            <LegendLeft>
                                                <Dot $color={c.color} />
                                                <span>{c.label}</span>
                                            </LegendLeft>
                                            <LegendPct>{c.pct}%</LegendPct>
                                            <LegendAmt>{c.amount}</LegendAmt>
                                        </LegendRow>
                                    ))}
                                </DonutLegend>
                            </DonutWrap>
                        </Card>
                    </TopRow>

                    {/* Row 2 */}
                    <BottomRow>
                        {/* Budget vs Actual */}
                        <Card>
                            <CardHeaderRow>
                                <CardTitle>Budget vs Actual</CardTitle>
                                <CardMeta>This Month</CardMeta>
                            </CardHeaderRow>
                            <BudgetList>
                                <BudgetRow>
                                    <IconChip $color="#0d6efd"><FontAwesomeIcon icon={faHouse} /></IconChip>
                                    <BudgetInfo>
                                        <BudgetName>Housing</BudgetName>
                                        <BudgetBarTrack><BudgetBarFill $pct="91%" $color="#0d6efd" /></BudgetBarTrack>
                                    </BudgetInfo>
                                    <BudgetAmt>$820 / $900</BudgetAmt>
                                </BudgetRow>
                                <BudgetRow>
                                    <IconChip $color="#198754"><FontAwesomeIcon icon={faUtensils} /></IconChip>
                                    <BudgetInfo>
                                        <BudgetName>Food &amp; Dining</BudgetName>
                                        <BudgetBarTrack><BudgetBarFill $pct="91%" $color="#198754" /></BudgetBarTrack>
                                    </BudgetInfo>
                                    <BudgetAmt>$547 / $600</BudgetAmt>
                                </BudgetRow>
                                <BudgetRow>
                                    <IconChip $color="#00d4aa"><FontAwesomeIcon icon={faBagShopping} /></IconChip>
                                    <BudgetInfo>
                                        <BudgetName>Shopping</BudgetName>
                                        <BudgetBarTrack><BudgetBarFill $pct="82%" $color="#00d4aa" /></BudgetBarTrack>
                                    </BudgetInfo>
                                    <BudgetAmt>$410 / $500</BudgetAmt>
                                </BudgetRow>
                                <BudgetRow>
                                    <IconChip $color="#ffc107"><FontAwesomeIcon icon={faCar} /></IconChip>
                                    <BudgetInfo>
                                        <BudgetName>Transport</BudgetName>
                                        <BudgetBarTrack><BudgetBarFill $pct="78%" $color="#ffc107" /></BudgetBarTrack>
                                    </BudgetInfo>
                                    <BudgetAmt>$274 / $350</BudgetAmt>
                                </BudgetRow>
                                <BudgetRow>
                                    <IconChip $color="#dc3545"><FontAwesomeIcon icon={faFilm} /></IconChip>
                                    <BudgetInfo>
                                        <BudgetName>Entertainment</BudgetName>
                                        <BudgetBarTrack><BudgetBarFill $pct="73%" $color="#dc3545" /></BudgetBarTrack>
                                    </BudgetInfo>
                                    <BudgetAmt>$219 / $300</BudgetAmt>
                                </BudgetRow>
                            </BudgetList>
                        </Card>

                        {/* Recent Transactions */}
                        <Card>
                            <CardHeaderRow>
                                <CardTitle>Recent Transactions</CardTitle>
                                <ViewAll>View all</ViewAll>
                            </CardHeaderRow>
                            <TxList>
                                <TxRow>
                                    <TxLeft>
                                        <TxAvatar $bg="#fdecec" $fg="#e11900">◎</TxAvatar>
                                        <div>
                                            <TxName>Target</TxName>
                                            <TxCat>Shopping</TxCat>
                                        </div>
                                    </TxLeft>
                                    <TxRight>
                                        <TxAmt>−$87.32</TxAmt>
                                        <TxDate>Today</TxDate>
                                    </TxRight>
                                </TxRow>
                                <TxRow>
                                    <TxLeft>
                                        <TxAvatar $bg="#e8f5ec" $fg="#00754a">S</TxAvatar>
                                        <div>
                                            <TxName>Starbucks</TxName>
                                            <TxCat>Food & Dining</TxCat>
                                        </div>
                                    </TxLeft>
                                    <TxRight>
                                        <TxAmt>−$6.45</TxAmt>
                                        <TxDate>Today</TxDate>
                                    </TxRight>
                                </TxRow>
                                <TxRow>
                                    <TxLeft>
                                        <TxAvatar $bg="#eceff1" $fg="#111">U</TxAvatar>
                                        <div>
                                            <TxName>Uber</TxName>
                                            <TxCat>Transport</TxCat>
                                        </div>
                                    </TxLeft>
                                    <TxRight>
                                        <TxAmt>−$18.90</TxAmt>
                                        <TxDate>Yesterday</TxDate>
                                    </TxRight>
                                </TxRow>
                                <TxRow>
                                    <TxLeft>
                                        <TxAvatar $bg="#e8f5ec" $fg="#00674a">W</TxAvatar>
                                        <div>
                                            <TxName>Whole Foods</TxName>
                                            <TxCat>Food & Dining</TxCat>
                                        </div>
                                    </TxLeft>
                                    <TxRight>
                                        <TxAmt>−$64.21</TxAmt>
                                        <TxDate>Yesterday</TxDate>
                                    </TxRight>
                                </TxRow>
                                <TxRow>
                                    <TxLeft>
                                        <TxAvatar $bg="#fff4e5" $fg="#ff9900">a</TxAvatar>
                                        <div>
                                            <TxName>Amazon</TxName>
                                            <TxCat>Shopping</TxCat>
                                        </div>
                                    </TxLeft>
                                    <TxRight>
                                        <TxAmt>−$129.99</TxAmt>
                                        <TxDate>May 24</TxDate>
                                    </TxRight>
                                </TxRow>
                            </TxList>
                        </Card>

                        {/* Cash Flow */}
                        <Card>
                            <CardHeaderRow>
                                <CardTitle>Cash Flow</CardTitle>
                                <CardMeta>This Month <FontAwesomeIcon icon={faChevronDown} /></CardMeta>
                            </CardHeaderRow>
                            <CashFlowList>
                                <CashRow>
                                    <span>Income</span>
                                    <CashAmt $positive>+$4,650.00</CashAmt>
                                </CashRow>
                                <CashRow>
                                    <span>Spending</span>
                                    <CashAmt>-$2,736.48</CashAmt>
                                </CashRow>
                                <CashRow>
                                    <span>Bills &amp; Subscriptions</span>
                                    <CashAmt>-$642.50</CashAmt>
                                </CashRow>
                                <CashDivider />
                                <CashRow>
                                    <strong>Remaining</strong>
                                    <CashAmt $positive $bold>+$1,271.02</CashAmt>
                                </CashRow>
                            </CashFlowList>
                            <OnTrack>
                                <OnTrackIcon><FontAwesomeIcon icon={faArrowTrendUp} /></OnTrackIcon>
                                <div>
                                    <OnTrackTitle>You're on track!</OnTrackTitle>
                                    <OnTrackText>You have $1,271.02 left to reach your goals.</OnTrackText>
                                </div>
                            </OnTrack>
                        </Card>
                    </BottomRow>
                </MockMain>
            </MockWindow>
        </MockShell>
    );
};

// -------------------------------------------------------- Shell.
const MockShell = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 460px;
`;

const MockGlow = styled.div`
    position: absolute;
    inset: 6% 0 -12% -6%;
    background: radial-gradient(ellipse at 70% 60%, rgba(0, 212, 170, 0.18) 0%, rgba(13, 110, 253, 0.14) 45%, transparent 72%);
    filter: blur(34px);
    z-index: 0;
    pointer-events: none;
`;

const MockWindow = styled.div`
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 145px minmax(0, 1fr);
    background: #fff;
    border-radius: 20px;
    border: 1px solid rgba(13, 110, 253, 0.08);
    box-shadow:
        0 30px 70px rgba(13, 110, 253, 0.14),
        0 10px 28px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    width: 100%;
    height: 100%;
`;

// -------------------------------------------------------- Sidebar (Light).
const MockSidebar = styled.aside`
    background: #ffffff;
    border-right: 1px solid var(--border-light);
    display: flex;
    flex-direction: column;
    padding: 1rem 0.7rem;
    gap: 1rem;
`;

const SidebarBrand = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0 0.3rem 0.35rem;
`;

const BrandMark = styled.div`
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    font-weight: 700;
    font-size: 0.95rem;
`;

const BrandName = styled.div`
    font-size: 0.95rem;
    font-weight: 700;
    color: #0b1f3a;
`;

const SidebarNav = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    margin-top: 0.35rem;
`;

const NavItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.6rem;
    border-radius: 9px;
    font-size: 0.74rem;
    font-weight: ${props => props.$active ? 600 : 500};
    color: ${props => props.$active ? 'var(--button-primary)' : props.$muted ? 'var(--text-muted)' : 'var(--text-secondary)'};
    background: ${props => props.$active ? 'rgba(13, 110, 253, 0.09)' : 'transparent'};

    svg {
        font-size: 0.78rem;
        width: 15px;
        color: ${props => props.$active ? 'var(--button-primary)' : 'var(--text-muted)'};
    }
`;

// -------------------------------------------------------- Main.
const MockMain = styled.div`
    padding: 0.9rem 0.95rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    background: #f7f9fc;
    min-width: 0;
`;

const MockHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
`;

const MockGreeting = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 600;
`;

const MockTitle = styled.div`
    font-size: 1.3rem;
    font-weight: 700;
    color: #0b1f3a;
    margin-top: 0.15rem;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const MonthDropdown = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: #fff;
    border: 1px solid var(--border-light);
    border-radius: 999px;
    padding: 0.35rem 0.7rem;

    svg { font-size: 0.6rem; color: var(--text-muted); }
`;

const IconButton = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #fff;
    border: 1px solid var(--border-light);
    color: var(--text-secondary);
    font-size: 0.72rem;
`;

const HeaderAvatar = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, var(--button-primary), var(--amount-positive));
    color: white;
    font-size: 0.72rem;
    font-weight: 700;
`;

// -------------------------------------------------------- Cards.
const Card = styled.div`
    background: white;
    border: 1px solid var(--border-light);
    border-radius: 14px;
    padding: 0.75rem 0.8rem;
    box-shadow: 0 2px 10px rgba(13, 110, 253, 0.04);
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
`;

const CardHeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;
`;

const CardTitle = styled.div`
    font-size: 0.78rem;
    font-weight: 700;
    color: #0b1f3a;
`;

const CardMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.65rem;
    color: var(--text-muted);
    font-weight: 500;

    svg { font-size: 0.55rem; }
`;

const ViewAll = styled.div`
    font-size: 0.66rem;
    font-weight: 600;
    color: var(--amount-positive);
`;

const TopRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.3fr);
    gap: 0.6rem;
`;

const BottomRow = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
    flex: 1;
`;

// -------------------------------------------------------- Spending Overview.
const SpendHead = styled.div`
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0.35rem 0 0.55rem;
`;

const SpendValue = styled.div`
    font-size: 1.15rem;
    font-weight: 700;
    color: #0b1f3a;
`;

const SpendPeriod = styled.div`
    font-size: 0.6rem;
    color: var(--text-muted);
`;

const SpendTrend = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    font-size: 0.6rem;
    font-weight: 600;
    color: var(--amount-positive);
    background: rgba(25, 135, 84, 0.1);
    border-radius: 999px;
    padding: 0.15rem 0.4rem;
    margin-left: auto;
`;

const ChartBody = styled.div`
    display: grid;
    grid-template-columns: 26px 1fr;
    gap: 0.3rem;
    flex: 1;
`;

const YAxis = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.1rem 0 1rem;
    font-size: 0.52rem;
    color: var(--text-muted);
    text-align: right;
`;

const ChartPlot = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
`;

const LineChartSVG = styled.svg`
    width: 100%;
    height: 100%;
    min-height: 84px;
    flex: 1;
    display: block;
`;

const XAxis = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 0.2rem;
    font-size: 0.52rem;
    color: var(--text-muted);
`;

// -------------------------------------------------------- Category Breakdown.
const DonutWrap = styled.div`
    display: flex;
    align-items: center;
    gap: 1.1rem;
    flex: 1;
    padding: 0.35rem 0;
`;

const DonutFig = styled.div`
    position: relative;
    width: 150px;
    height: 150px;
    flex-shrink: 0;
`;

const DonutSVG = styled.svg`
    width: 150px;
    height: 150px;
    transform: rotate(-90deg);
`;

const DonutCenter = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const DonutTotal = styled.div`
    font-size: 0.92rem;
    font-weight: 700;
    color: #0b1f3a;
`;

const DonutCaption = styled.div`
    font-size: 0.6rem;
    color: var(--text-muted);
`;

const DonutLegend = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.55rem;
    min-width: 0;
`;

const LegendRow = styled.div`
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.68rem;
`;

const LegendLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--text-secondary);
    min-width: 0;

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const LegendPct = styled.div`
    color: var(--text-muted);
    font-weight: 500;
`;

const LegendAmt = styled.div`
    color: #0b1f3a;
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
`;

const Dot = styled.span`
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: ${props => props.$color};
    flex-shrink: 0;
`;

// -------------------------------------------------------- Budget vs Actual.
const BudgetList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    flex: 1;
    justify-content: space-between;
`;

const BudgetRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.55rem;
`;

const IconChip = styled.span`
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: ${props => `${props.$color}1a`};
    color: ${props => props.$color};
    font-size: 0.7rem;
    flex-shrink: 0;
`;

const BudgetInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
`;

const BudgetName = styled.div`
    font-size: 0.66rem;
    font-weight: 600;
    color: var(--text-secondary);
`;

const BudgetBarTrack = styled.div`
    height: 6px;
    background: #eef2f6;
    border-radius: 999px;
    overflow: hidden;
`;

const BudgetBarFill = styled.div`
    width: ${props => props.$pct};
    height: 100%;
    border-radius: 999px;
    background: ${props => props.$color};
`;

const BudgetAmt = styled.div`
    font-size: 0.6rem;
    color: var(--text-muted);
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
    flex-shrink: 0;
`;

// -------------------------------------------------------- Recent Transactions.
const TxList = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-between;
`;

const TxRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.42rem 0;
    border-bottom: 1px solid var(--border-light);

    &:first-child { padding-top: 0; }
    &:last-child { border-bottom: none; padding-bottom: 0; }
`;

const TxLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-width: 0;

    > div {
        min-width: 0;
    }
`;

const TxAvatar = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: ${props => props.$bg};
    color: ${props => props.$fg};
    display: grid;
    place-items: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
`;

const TxName = styled.div`
    font-size: 0.76rem;
    font-weight: 600;
    color: #0b1f3a;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TxCat = styled.div`
    font-size: 0.62rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TxRight = styled.div`
    text-align: right;
    flex-shrink: 0;
`;

const TxAmt = styled.div`
    font-size: 0.76rem;
    font-weight: 700;
    color: #0b1f3a;
    line-height: 1.2;
`;

const TxDate = styled.div`
    font-size: 0.62rem;
    color: var(--text-muted);
`;

// -------------------------------------------------------- Cash Flow.
const CashFlowList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    flex: 1;
    justify-content: center;
`;

const CashRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    font-size: 0.68rem;
    color: var(--text-secondary);

    > span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    strong {
        color: #0b1f3a;
        font-weight: 700;
    }
`;

const CashAmt = styled.div`
    font-size: ${props => props.$bold ? '0.8rem' : '0.68rem'};
    font-weight: ${props => props.$bold ? 700 : 600};
    color: ${props => props.$positive ? 'var(--amount-positive)' : '#0b1f3a'};
`;

const CashDivider = styled.div`
    height: 1px;
    background: var(--border-light);
    margin: 0.2rem 0;
`;

const OnTrack = styled.div`
    margin-top: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(25, 135, 84, 0.09);
    border: 1px solid rgba(25, 135, 84, 0.18);
    border-radius: 12px;
    padding: 0.7rem 0.75rem;
`;

const OnTrackIcon = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    background: rgba(25, 135, 84, 0.15);
    color: var(--amount-positive);
    font-size: 0.8rem;
    flex-shrink: 0;
`;

const OnTrackTitle = styled.div`
    font-size: 0.74rem;
    font-weight: 700;
    color: var(--amount-positive);
    margin-bottom: 0.15rem;
`;

const OnTrackText = styled.div`
    font-size: 0.62rem;
    color: var(--text-secondary);
    line-height: 1.3;
`;

export default HeroProductMock;
