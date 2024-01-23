import { Request } from "express";

/**
 * ### Checks `request.query.page` and verifies that it is
 * ### a digit.
 * @returns Items to skip for pagination
 */
export default function itemsToSkip(request: Request, count: number) {
    let pageNum: number;
    const isDigit = /^[0-9]+$/g;

    const page = request.query.page as string;

    if (page && isDigit.test(page)) {
        pageNum = parseInt(page, 10) - 1;
    } else {
        pageNum = 0;
    }

    return pageNum * count;
}