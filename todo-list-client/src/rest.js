
export const fetchBackend = async (...fetchArgs) => {
    let json;
    try {
        const resp = await window.fetch(...fetchArgs);
        json = await resp.json();
    } catch (e) {
        // eslint-disable-next-line
        throw {
            code: 'UNEXPECTED_ERROR',
            message: '' + e
        };
    }

    if (!json) {
        // eslint-disable-next-line
        throw {
            code: 'UNEXPECTED_ERROR',
            message: 'empty json response'
        };
    }

    if (json.error) {
        throw json.error;
    }

    return json.result;
};