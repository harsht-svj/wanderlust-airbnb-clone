const mongoose = require("mongoose");
const listing = require("../models/listing.js");
require("dotenv").config();

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("connected");

    const allListings = await listing.find({});

    for (let l of allListings) {
        try {
            const response = await geocodingClient
                .forwardGeocode({
                    query: `${l.location}, ${l.country}`,
                    limit: 1,
                })
                .send();

            if (response.body.features.length > 0) {
                l.geometry = response.body.features[0].geometry;
                await l.save();
                console.log(`Updated: ${l.title} -> ${l.location}`);
            } else {
                console.log(`No result for: ${l.title}`);
            }
        } catch (err) {
            console.log(`Error for ${l.title}:`, err.message);
        }
    }

    console.log("All done!");
    mongoose.connection.close();
}

main();