(function(exports) {

function bytes2word(byte1, byte2) {
	return (byte2 << 8) + byte1;
}
function bytes2dword(byte1, byte2, byte3, byte4) {
	return (byte4 << 24) + (byte3 << 16) + (byte2 << 8) + byte1;
}
function words2dword(word1, word2) {
	return (word2 << 16) + word1;
}
function dword2bytes(dw) {
	return [dw & 255, (dw >>> 8) & 255, (dw >>> 16) & 255, (dw >>> 24) & 255];
}
function word2bytes(w) {
	return [w & 255, (w >>> 8) & 255];
}
function dword2words(dw) {
	return [dw & 65535, (dw >>> 16) & 65535];
}

exports.bytes2word = bytes2word;
exports.bytes2dword = bytes2dword;
exports.words2dword = words2dword;
exports.dword2bytes = dword2bytes;
exports.word2bytes = word2bytes;
exports.dword2words = dword2words;
	
})(typeof window === 'object' ? window : module.exports);