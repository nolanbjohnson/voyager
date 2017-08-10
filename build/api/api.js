"use strict";
/**
 * This file stores API for making request to CompassQL (either within the browser or via the server).
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("isomorphic-fetch");
var recommend_1 = require("compassql/build/src/recommend");
var schema_1 = require("compassql/build/src/schema");
exports.Schema = schema_1.Schema;
var plot_1 = require("../models/plot");
/**
 * Submit recommendation query request from CompassQL
 */
function fetchCompassQLRecommend(query, schema, data, config) {
    if (config && config.serverUrl) {
        var endpoint = "recommend";
        return fetch(config.serverUrl + "/" + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                query: query,
                // fieldSchemas are just JSON
                schema: schema.fieldSchemas,
                data: data
            })
        }).then(function (response) {
            return response.json();
        });
    }
    else {
        return new Promise(function (resolve) {
            var modelGroup = recommend_1.recommend(query, schema).result;
            resolve(plot_1.convertToPlotObjectsGroup(modelGroup, data));
        });
    }
}
exports.fetchCompassQLRecommend = fetchCompassQLRecommend;
/**
 * Submit schema building request from CompassQL
 */
function fetchCompassQLBuildSchema(data, config) {
    if (config && config.serverUrl) {
        var endpoint = "build";
        return fetch(config.serverUrl + "/" + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                data: data
            })
        }).then(function (response) {
            return response.json();
        }).then(function (fields) {
            return new schema_1.Schema({ fields: fields.fields });
        });
    }
    else {
        return new Promise(function (resolve) {
            resolve(schema_1.build(data));
        });
    }
}
exports.fetchCompassQLBuildSchema = fetchCompassQLBuildSchema;