import { Request } from "express";

export function skipItemsForPage(request: Request) {
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