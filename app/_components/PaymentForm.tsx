"use client";
import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './PaymentForm.module.css';
import { StripeCardElementOptions } from '@stripe/stripe-js';

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState({
        country: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Check if Stripe and Elements are loaded
        if (stripe && elements) {
            // Initialize any setup if needed
        }
    }, [stripe, elements]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        if (!stripe || !elements) {
            setIsLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setErrorMessage('Card details are required');
            setIsLoading(false);
            return;
        }

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name,
                    email,
                    address: {
                        country: address.country,
                        line1: address.line1,
                        line2: address.line2,
                        city: address.city,
                        state: address.state,
                        postal_code: address.postalCode,
                    },
                },
            });

            if (error && error.message) {
                setErrorMessage(error.message);
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/payment_intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentMethodId: paymentMethod?.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret, paymentIntent } = await response.json();

            if (clientSecret) {
                const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                    },
                    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/return`,
                });

                if (confirmError && confirmError.message) {
                    setErrorMessage(confirmError.message);
                    setIsLoading(false);
                    return;
                }

                if (paymentIntent && paymentIntent.status === 'succeeded') {
                    setSuccessMessage('Payment successful!');
                    setErrorMessage('');
                    setIsLoading(false);
                    // Reset form fields or redirect to a success page
                } else {
                    setErrorMessage('PaymentIntent not succeeded');
                    setIsLoading(false);
                }
            }
        } catch (error: any) {
            setErrorMessage(error?.message || "");
            setIsLoading(false);
        }
    };

    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
    };

    const handleCancel = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = '/';
        setErrorMessage('');
        setSuccessMessage('');
    };

    const cardElementOptions: StripeCardElementOptions = {
        style: {
            base: {
                iconColor: '#c4f0ff',
                color: '#000',
                fontWeight: 500,
                fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                fontSize: '16px',
                fontSmoothing: 'antialiased',
                '::placeholder': {
                    color: '#999',
                },
                ':-webkit-autofill': {
                    color: '#fce883',
                },
            },
            complete: {
                color: 'green',
            },
            invalid: {
                iconColor: 'red',
                color: 'red',
            },
        },
        hidePostalCode: true,
    };

    return (
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
            <h2 className={styles.heading2}>Payment Details</h2>
            {stripe && elements && (<div className={styles.field}>
                <label className={styles.label}>Card Information</label>
                <CardElement className={styles.cardElement} options={cardElementOptions} />
            </div>)}
            <div className={styles.field}>
                <label className={styles.label}>Name</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder='Cardholder Name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                    className={styles.input}
                    placeholder='Email'
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className={styles.field}>
                <label className={styles.label}>Billing Address</label>
                <input
                    className={styles.input}
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={address.country}
                    onChange={handleAddressChange}
                    required
                />
                <input
                    className={styles.input}
                    type="text"
                    name="line1"
                    placeholder="Address Line 1"
                    value={address.line1}
                    onChange={handleAddressChange}
                    required
                />
                <input
                    className={styles.input}
                    type="text"
                    name="line2"
                    placeholder="Address Line 2 (optional)"
                    value={address.line2}
                    onChange={handleAddressChange}
                />
                <div className={styles.row}>
                    <input
                        className={styles.input}
                        type="text"
                        name="city"
                        placeholder="City"
                        value={address.city}
                        onChange={handleAddressChange}
                        required
                    />
                    <input
                        className={styles.input}
                        type="text"
                        name="state"
                        placeholder="State/Province"
                        value={address.state}
                        onChange={handleAddressChange}
                        required
                    />
                </div>
                <input
                    className={styles.input}
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    required
                />
            </div>
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}
            <div className={styles.buttonContainer}>
                <button className={styles.cancelButton} type="button" onClick={handleCancel}>
                    Cancel
                </button>
                <button className={styles.saveButton} type="submit" disabled={!stripe || isLoading}>
                    {isLoading ? 'Processing...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default PaymentForm;
