import ApiRequestTester from "../../component/ApiRequestTester/ApiRequestTester";

const Verify = () => {
  return (
      <div>
          <ApiRequestTester
              title={"API Verification Request Tester "}
              placeholder={"https://example.com/api/v1/Gateway/Status"}
              selectedRequest={"VerificationRequest"}  // ReturnRequest
          />
      </div>
  )
}
export default Verify;