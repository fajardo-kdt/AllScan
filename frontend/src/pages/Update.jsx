import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

function Update() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    const navigate = useNavigate()

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            }, fps: 10,
        });

        scanner.render(success);
        scannerRef.current = scanner;

        async function success(result) {
            scanner.clear();
            scannerRef.current = null;
            setLoading(true);

            try {
                const location = await getLocation();
                await axios.put(`http://localhost:5000/api/update-location/${result}`, { location });
                alert('Location updated successfully');
                navigate("/");
            } catch (err) {
                setError('Error updating location');
            } finally {
                setLoading(false);
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
        };
    }, []);

    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    resolve(`${latitude},${longitude}`);
                }, reject);
            } else {
                reject('Geolocation is not supported by this browser.');
            }
        });
    };

    return (
        <div>
            <h1>Update Product Location</h1>
            <div id="reader" width="600px"></div>
            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}
        </div>
    );
}

export default Update;
