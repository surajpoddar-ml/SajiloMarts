export class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Factory for 200 OK responses.
   */
  static success(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  /**
   * Factory for 201 Created responses.
   */
  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, data, message);
  }

  /**
   * Factory for paginated list responses.
   */
  static paginated(data, pagination, message = 'Success') {
    const response = new ApiResponse(200, data, message);
    response.pagination = pagination;
    return response;
  }
}
