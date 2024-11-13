import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Modal from 'react-modal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

Modal.setAppElement('#root'); // Set the root element for accessibility

function Home() {
    const [product, setProduct] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (!modalIsOpen) {
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                }, fps: 10,
            });

            scanner.render(success);
            scannerRef.current = scanner;
        }

        async function success(result) {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
            setLoading(true);

            try {
                const res = await axios.get(`http://localhost:5000/api/product/${result}`);
                if (res.data) {
                    const productData = res.data;
                    if (productData.qrCode) {
                        productData.qrCode = `data:image/png;base64,${productData.qrCode}`;
                    }
                    setProduct(productData);
                    setModalIsOpen(true);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                setError('Error fetching product');
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
    }, [modalIsOpen]);

    const closeModal = () => {
        setModalIsOpen(false);
        setProduct(null);
        setError(null);
    };

    return (
        <div>
            <div>
                <h1>QR Code Scanning in React</h1>
                <div id="reader" width="600px"></div>
            </div>
            <button><Link to="/create">Create Product</Link></button>
            <button><Link to="/update">Update Product</Link></button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Product Details"
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                    },
                }}
            >
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : product ? (
                    <div>
                        <h1>Product Details</h1>
                        <p><strong>Name:</strong> {product.name}</p>
                        <p><strong>Quantity:</strong> {product.quantity}</p>
                        <p><strong>Product Code:</strong> {product.productCode}</p>
                        {product.qrCode && <img src={product.qrCode} alt="QR Code" />}
                        {product.location && (
                            <MapContainer center={product.location.split(',').map(Number)} zoom={13} style={{ height: '400px', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={product.location.split(',').map(Number)}>
                                    <Popup>
                                        Product Location
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        )}
                        <button onClick={closeModal}>Close</button>
                    </div>
                ) : (
                    <div>Product not found</div>
                )}
            </Modal>
        </div>
    );
}

export default Home;
