import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

function Create() {
    const [product, setProduct] = useState({
        name: '',
        quantity: '',
        productCode: '',
        location: '',
        qrCode: ''
    })

    const [imageUrl, setImageUrl] = useState('');

    const navigate = useNavigate()

    const handleChange = (e) => {
        setProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleClick = async (e) => {
        e.preventDefault()
        try {
            await axios.post("http://localhost:5000/api/create", product);
            navigate("/");
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const generateQrCode = async () => {
            if (product.productCode) {
                try {
                    const response = await QRCode.toDataURL(product.productCode);
                    setImageUrl(response);
                    setProduct((prev) => ({ ...prev, qrCode: response }));
                } catch (err) {
                    console.log(err);
                }
            }
        };

        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    console.log(position);
                    const { latitude, longitude } = position.coords;
                    setProduct((prev) => ({ ...prev, location: `${latitude},${longitude}` }));
                });
            } else {
                console.log("Geolocation is not supported by this browser.");
            }
        };

        generateQrCode();
        getLocation();
    }, [product.productCode]);

    return (
        <div>
            <form>
                <h1>Add new Product</h1>
                <label>Name: <input type='text' name='name' placeholder='Name' required onChange={handleChange} /></label>
                <label>Quantity: <input type='number' name='quantity' placeholder='Quantity' required onChange={handleChange} /></label>
                <label>Product Code: <input type='text' name='productCode' placeholder='Product Code' required onChange={handleChange} /></label>
                
                {imageUrl && (
                    <div>
                        <img src={imageUrl} alt='qr' />
                        <a href={imageUrl} download={`${product.name}.png`}>
                            <button type="button">Download QR Code</button>
                        </a>
                    </div>
                )}
                <button onClick={handleClick}>Add</button>
            </form>
        </div>
    )
}

export default Create