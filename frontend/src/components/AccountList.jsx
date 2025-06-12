import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAccounts } from '../services/api';

const AccountList = () => {

    const [accounts, setAccounts] = useState([]);

    // -------------------------------------------------------- Handle Accounts Import
    const importAccounts = async () => {
        try {
            const res = await getAccounts();
            setAccounts(res.data);
        } catch (err) {
            console.log("ERROR IMPORTING STATS");
        }
    };

    useEffect(() => {
        importAccounts();
    }, []);

    return (
        <AccountListWrapper>
            <AccountHeader>
                Take a look at some of your accounts! 
            </AccountHeader>
            {accounts.map((acc, index) => (
                <AccountObject>
                    {acc.name}
                </AccountObject>
            ))}
        </AccountListWrapper>

    );
};

const AccountListWrapper = styled.div`
    display: flex;
    width: 90%;
    flex-direction: column;
`

const AccountHeader = styled.h1`
    display: flex;
`

const AccountObject = styled.div`
    padding: 1rem;
`

export default AccountList;