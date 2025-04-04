import ApiRequestTester from "../../component/ApiRequestTester/ApiRequestTester";

const Return = () => {
  return (
      <div>
          <ApiRequestTester
              title={"API Return Request Tester "}
              placeholder={"https://example.com/api/v1/Gateway/Status"}
              selectedRequest={"ReturnRequest"}
          />
      </div>
  )
}
export default Return;