import { Request } from "express";

/**
 * ### Checks `request.query.page` and verifies that it is
 * ### a digit.
 * @param request 
 * @returns Items to skip for pagination
 */
export default function skipItemsForPage(request: Request) {
    let pageNum: number;
    const checkDigit = /^[0-9]+$/g; // regex to check digit

    const page = request.query.page;

    // validate that page is a number
    if (!page || typeof page !== 'string') {
        pageNum = 0
    } else {
        pageNum = !checkDigit.test(page) ? 0 : parseInt(page, 10) - 1;
    }

    // set pagination
    return pageNum * 25;
}