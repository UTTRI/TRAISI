import { Address } from "traisi-question-sdk";
import { Purpose } from "./purpose.model";

export interface PurposeLocation {
    purpose: Purpose;
    address: Address;
    latitide: number;
    longitude: number;
}