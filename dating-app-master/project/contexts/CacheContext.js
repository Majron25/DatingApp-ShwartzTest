import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiRequestor from '../ApiRequestor.js';
import utils from '../utils/utils.js';


const CacheContext = createContext();

// The maximum size (in MBs) of the cacheFirstImages state variable.
const maxSizeCacheFirstImages = 30;


function CacheProvider({ children }) 
{
    /* A cache of the users' (first) images. */
    const [ cacheFirstImages, setCacheFirstImages ] = useState(
        {
            // The size of all of the images in firstImages (bytes).
            size: 0,

            /* Each key is a user's ID and the corresponding value their first image.*/
            images: { }
        }
    );

    /**
    * Updates cacheFirstImages with new images from the server while making sure that it doesn't exceed the maximum 
      size, maxSizeCacheFirstImages.

    * Parameters:
        @param {Array} userIdsGetImages  - The IDs of the users whose firstImage properties are to be fetched from the 
        server.
        @param {Array} userIdsDisplayed - The users who are currently being displayed on the screen. It's assumed that 
        their _id property is present, and that their images (stored in cacheFirstImages) are being displayed on the 
        screen. Sometimees images will have to be deleted to ensure that cacheFirstImages doesn't exceed its max size; 
        when this happens, the images that are already being displayed (i.e. the images of those in userDataDisplayed) 
        shouldn't be deleted.
    */
    const updateCacheFirstImages = async (userIdsGetImages, userIdsDisplayed) =>
    {
        if (userIdsGetImages.length == 0)
        {
            // Still modify the state so that the page re-renders.
            setCacheFirstImages((prev) => { return { ...prev } });
            return;
        }

        // Fetch the images for the remaining ids.
        const response = await ApiRequestor.getUsersFirstImages(userIdsGetImages);

        if (response.status != 200)
        {
            console.log("CacheContext.updateCacheFirstImages: there was a problem fetching users' images.");
            return;
        }

        const usersImages = response.data;

        console.log("Number of images: " + Object.keys(usersImages).length);

        // Calculate the size (in Bytes) of the returned images.
        const sizeUserImages = Object.keys(usersImages).reduce(
            (accumulator, key) =>
            {
                return accumulator + usersImages[key].length;
            },
            0
        );

        console.log(`Approx Size of Images: ${sizeUserImages/Math.pow(10, 6)}MB`);

        setCacheFirstImages(
            (prev) => 
            {
                const newSize = prev.size + sizeUserImages;

                if (newSize <= maxSizeCacheFirstImages * Math.pow(10, 6))
                {
                    console.log(`Size limit of images cache isn't reached yet: ${newSize/Math.pow(10, 6)}MB <= ${maxSizeCacheFirstImages}MB`);
                    return { size: newSize, images: { ...prev.images, ...usersImages } };
                }

                // The size of the overflow.
                let overflowAmount = newSize - (maxSizeCacheFirstImages * Math.pow(10, 6));

                console.log("Maximum size of the images cache will be exceeded: must delete some unused images.");

                const imagesIdsCurrent = Object.keys(prev.images);

                const imagesNew = { ...prev.images, ...usersImages };

                // Delete images from imagesCurrent until the maximum won't be exceeded when adding the new images.
                let numBytesDeleted = 0;
                let enoughDeleted = false;
                let numDeleted = 0;
                let numImagesNotDisplayed = imagesIdsCurrent.length - userIdsDisplayed.length;
                let minNumImagesToDelete = Math.floor(numImagesNotDisplayed * 0.5);
                for (const userId of imagesIdsCurrent)
                {
                    // Don't delete images that are currently being displayed.
                    if (userIdsDisplayed.includes(userId))
                        continue;

                    delete imagesNew[userId];

                    overflowAmount -= prev.images[userId].length;
                    numBytesDeleted += prev.images[userId].length;
                    numDeleted++;

                    if (overflowAmount <= 0 && numDeleted >= minNumImagesToDelete)
                    {
                        enoughDeleted = true;
                        console.log("Enough images have been for deleted.");
                        break;
                    }
                }

                console.log(`Deleted ${numDeleted} images.`);

                if (!enoughDeleted)
                    console.log("Couldn't delete enough images to keep the images cache under the maximum.");

                return { size: prev.size - numBytesDeleted + sizeUserImages, images: imagesNew };
            }
        );
    };

    // Log the size of the cache.
    useEffect(
        () => 
        {
            if (cacheFirstImages?.images)
            {
                console.log(`Size of first images cache: ${cacheFirstImages.size / Math.pow(10, 6)}MB.`);
                console.log("Number of cached images: " + Object.keys(cacheFirstImages.images).length);
            }
            else
            {
                console.log("The cached images are undefined. Something went wrong.")
            }
        },
        [ cacheFirstImages ]
    );

    return (
        <CacheContext.Provider 
            value = {{ 
                cacheFirstImages, updateCacheFirstImages 
            }}
        >
            {children}
        </CacheContext.Provider>
    );
}

function useCache() 
{
    return useContext(CacheContext);
}


export { CacheProvider as default, useCache };