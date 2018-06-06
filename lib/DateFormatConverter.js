const dateFormat = (type, date) => {
    if(type === 'yyyy-mm-dd'){
        const year = date.substring(0, 4);
        const month = date.substring(4, 6);
        const day = date.substring(6, 8);

        return year+'-'+month+'-'+day
    } else if(type === 'usd'){
        return '';
    } else if(type === 'yyyy-mm-dd hh:mm'){
        return '';
    } else {
        throw new Error('it is not support format');
    }
}

module.exports = dateFormat;