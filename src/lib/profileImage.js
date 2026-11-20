const DEFAULT_PROFILE_IMAGE =
  import.meta.env.VITE_DEFAULT_PROFILE_IMAGE_URL?.trim() || "";
const LOCAL_PROFILE_FALLBACK = `${import.meta.env.BASE_URL}Icon.png`;

const getProfileImageUrl = (profilePic) => {
  const imageUrl = typeof profilePic === "string" ? profilePic.trim() : "";

  if (!imageUrl || /\/profile_iq6sem\.png(?:\?.*)?$/.test(imageUrl)) {
    return DEFAULT_PROFILE_IMAGE || LOCAL_PROFILE_FALLBACK;
  }

  return imageUrl;
};

const handleProfileImageError = (event) => {
  const image = event.currentTarget;
  let defaultImageUrl = null;
  try {
    if (DEFAULT_PROFILE_IMAGE) {
      defaultImageUrl = new URL(DEFAULT_PROFILE_IMAGE, window.location.href).href;
    }
  } catch {
    defaultImageUrl = null;
  }

  if (defaultImageUrl && image.src !== defaultImageUrl) {
    image.src = DEFAULT_PROFILE_IMAGE;
    return;
  }

  image.onerror = null;
  image.src = LOCAL_PROFILE_FALLBACK;
};

export const profileImageProps = (profilePic) => ({
  src: getProfileImageUrl(profilePic),
  onError: handleProfileImageError,
});
