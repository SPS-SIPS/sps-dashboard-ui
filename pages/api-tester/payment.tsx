import ApiRequestTester from "../../component/ApiRequestTester/ApiRequestTester";

const Payment = () => {
  return (
      <div>
          <ApiRequestTester
              title={"API Payment Request Tester "}
              placeholder={"https://example.com/api/v1/Gateway/Status"}
              selectedRequest={"PaymentRequest"}
          />
      </div>
  )
}

export default Payment;