import axios from 'axios';
import cheerio from 'cheerio';
import { extractJobData } from './extractor';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
    maxConcurrent: 5,
    minTime: 200, // Minimum time between requests in ms
});

// Custom error handling for Axios errors with retries
const handleAxiosError = async (error: any, url: string, retries: number): Promise<string|null> => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            if (error.response.status === 404) {
                console.error(`404 Not Found: ${url}`);
            } else if (error.response.status === 429) {
                console.warn(`429 Too Many Requests: ${url}`);
                if (retries > 0) {
                    const retryAfter = error.response.headers['retry-after'];
                    const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000; // Default 5 seconds
                    console.log(`Retrying after ${delay} ms... ${retries} retries left.`);
                    await new Promise(res => setTimeout(res, delay));
                    return fetchWithRetry(url, retries - 1);
                }
            }
        } else {
            console.error(`Error: ${error.message}`);
        }
    } else {
        console.error(`Unknown error: ${error}`);
    }
    return null;
};

// Fetch data with retry logic and error handling
const fetchWithRetry = async (url: string, retries: number = 3): Promise<string | null> => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        return handleAxiosError(error, url, retries);
    }
};

export async function crawlUrls(urls: string[]) {
    for (const url of urls) {
        await limiter.schedule(async () => {
            try {
                const data = await fetchWithRetry(url);
                if (data) {
                    const $ = cheerio.load(data);
                    const jobHtml = $('body').html();
                    if (jobHtml) {
                        // console.log({
                        //     jobHtml
                        // })
                        const jobData = await extractJobData(jobHtml);
                        // if (jobData) {
                        //     // Save jobData to database
                        // }
                    }
                }
            } catch (error) {
                console.error(`Error crawling URL ${url}:`, error);
            }
        });
    }
}
