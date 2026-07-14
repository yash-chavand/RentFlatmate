class ApiResponse {
  constructor(data = {}, message = 'OK', success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
