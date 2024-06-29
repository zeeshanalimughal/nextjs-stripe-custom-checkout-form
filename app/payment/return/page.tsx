'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './ReturnPage.module.css';
import { Suspense } from 'react'

const ReturnPage = () => {
    const searchParams = useSearchParams();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');
        const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
        const redirectStatus = searchParams.get('redirect_status');

        if (paymentIntentId && paymentIntentClientSecret) {
            if (redirectStatus === 'succeeded') {
                setMessage('Payment succeeded!');
            } else if (redirectStatus === 'failed') {
                setMessage('Payment failed.');
            } else {
                setMessage('Payment status unknown.');
            }
        }
    }, [searchParams]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={styles.returnPage}>
                <h2 className='heading2'>Payment Status</h2>
                <p>{message}</p>
            </div>
        </Suspense>
    );
};

export default ReturnPage;
