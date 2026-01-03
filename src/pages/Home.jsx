import React from 'react';
import { Container, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCarousel from '../components/ProductCarousel';
import ProductGridTwoColumn from '../components/ProductGridTwoColumn';
import { useProduct } from '../context/ProductContext';
import './Home.css';

const Home = () => {
    const { getProductsByCategory, getProductsByIds, recentlyViewedIds, getSuggestedProducts } = useProduct();

    // Data for different sections derived from context
    const exclusiveOffers = getProductsByIds([1, 2, 3, 4, 25, 26, 27, 28]);

    // Use real history if available, else fallback or empty
    const recentlyViewed = recentlyViewedIds.length > 0
        ? getProductsByIds(recentlyViewedIds)
        : [];

    const suggestedProducts = getSuggestedProducts();

    const electronics = getProductsByCategory('Electronics').slice(0, 8);
    const fashion = getProductsByCategory('Fashion').slice(0, 8);
    const homeKitchen = getProductsByCategory('Home & Kitchen').slice(0, 8);
    const beauty = getProductsByCategory('Beauty').slice(0, 8);

    return (
        <>
            <div className="home-page">
                {/* Hero Section */}
                <Carousel className="mb-4 hero-carousel">
                    <Carousel.Item className="hero-item">
                        <div className="d-flex align-items-center justify-content-center h-100">
                            <h3>Big Sale Coming Soon!</h3>
                        </div>
                        <Carousel.Caption>
                            <h3>First Slide Label</h3>
                            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item className="hero-item">
                        <div className="d-flex align-items-center justify-content-center h-100">
                            <h3>New Arrivals</h3>
                        </div>
                        <Carousel.Caption>
                            <h3>Second Slide Label</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>

                {/* Categories Bar */}
                <Container className="my-5 section-container">
                    <h3 className="text-center mb-4 fw-bold">Shop by Category</h3>
                    <div className="d-flex flex-nowrap flex-xl-wrap justify-content-xl-center overflow-auto pb-3 gap-3 gap-xl-4 category-scroll-container">
                        {[
                            { name: "Electronics", img: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=150&q=80" },
                            { name: "Fashion", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=150&q=80" },
                            { name: "Home & Kitchen", img: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=150&q=80" },
                            { name: "Beauty", img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=150&q=80" },
                            { name: "Sports", img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=150&q=80" },
                            { name: "Toys", img: "https://images.unsplash.com/photo-1559715541-5daf8a0296d0?auto=format&fit=crop&w=150&q=80" },
                            { name: "Books", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80" }
                        ].map((cat, index) => (
                            <Link to={`/category/${cat.name}`} key={index} className="text-decoration-none text-dark text-center category-item">
                                <div className="category-img-wrapper mb-2 shadow-sm">
                                    <img src={cat.img} alt={cat.name} className="img-fluid w-100 h-100 object-fit-cover" />
                                </div>
                                <span className="fw-semibold small">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </Container>

                <Container>
                    <ProductCarousel title="Exclusive Offers" products={exclusiveOffers} />

                    {/* Split Section: Recently Viewed & Suggested */}
                    {(recentlyViewed.length > 0 || suggestedProducts.length > 0) && (
                        <ProductGridTwoColumn
                            leftTitle="Recently Viewed"
                            leftProducts={recentlyViewed.length > 0 ? recentlyViewed : exclusiveOffers.slice(0, 4)}
                            rightTitle="Suggested for You"
                            rightProducts={suggestedProducts.length > 0 ? suggestedProducts : electronics.slice(0, 4)}
                        />
                    )}

                    <ProductCarousel title="Best in Electronics" products={electronics} viewAllLink="/category/Electronics" />
                    <ProductCarousel title="Trending Fashion" products={fashion} viewAllLink="/category/Fashion" />
                    <ProductCarousel title="Home & Kitchen Essentials" products={homeKitchen} viewAllLink="/category/Home & Kitchen" />
                    <ProductCarousel title="Beauty & Personal Care" products={beauty} viewAllLink="/category/Beauty" />
                </Container>
            </div>
        </>
    );
};

export default Home;
