import { useState, useEffect, useCallback } from 'react';
import { bannerService } from '../services/bannerService';

export const useBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bannerService.getAll({ admin: true });
      setBanners(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const createBanner = async (formData) => {
    try {
      await bannerService.create(formData);
      await fetchBanners();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateBanner = async (id, formData) => {
    try {
      await bannerService.update(id, formData);
      await fetchBanners();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteBanner = async (id) => {
    try {
      await bannerService.delete(id);
      await fetchBanners();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateBannerStatus = async (banner, isActive) => {
    const previousBanners = banners;
    setBanners((currentBanners) => currentBanners.map((currentBanner) => (
      currentBanner.id === banner.id
        ? { ...currentBanner, active: isActive }
        : currentBanner
    )));

    const formData = new FormData();
    formData.append('active', isActive);
    formData.append('title', banner.title || '');
    formData.append('link_url', banner.link_url || '');
    formData.append('display_order', banner.display_order ?? 0);

    try {
      await bannerService.update(banner.id, formData);
      return { success: true };
    } catch (err) {
      setBanners(previousBanners);
      return { success: false, error: err.message };
    }
  };

  return {
    banners,
    loading,
    error,
    refresh: fetchBanners,
    createBanner,
    updateBanner,
    updateBannerStatus,
    deleteBanner
  };
};
