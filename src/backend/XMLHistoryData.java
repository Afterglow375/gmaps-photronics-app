package backend;

import java.io.IOException;
import java.io.StringReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class XMLHistoryData
 */
public class XMLHistoryData extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public XMLHistoryData() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String id = request.getParameter("xmlId");
		String query = "SELECT data AS XMLDATA FROM xml_data_mart WHERE xml_data_id = ?";

		Connection conn = null;
		PreparedStatement stmt = null;
		try {
			conn = MainData.getConnection();
			stmt = conn.prepareStatement(query);
			stmt.setString(1, id);
			ResultSet rs = stmt.executeQuery();
			rs.next();
			response.setContentType("application/xml");
			response.getWriter().print(rs.getString("XMLDATA"));
			
			// Closing resources
			rs.close();
			stmt.close();
			conn.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally { // Ensuring resources are closed
			try {
				if (stmt != null)
					stmt.close();
			} catch(SQLException se2) {
				
			}
			try {
				if (conn != null)
					conn.close();
			} catch(SQLException se) {
				se.printStackTrace();
			}
		}
	}	

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String xmlData = request.getParameter("xmlData");
		String id = request.getParameter("xmlId");
		String updateStr = "UPDATE xml_data_mart SET data = ?, data_modified = 'Y' WHERE xml_data_id = ?";
		StringReader reader = new StringReader(xmlData);
		
		Connection conn = null;
		PreparedStatement stmt = null;
		try {
			conn = MainData.getConnection();
			stmt = conn.prepareStatement(updateStr);
			stmt.setString(2, id);
			stmt.setCharacterStream(1, reader);
			stmt.executeUpdate();
			// Closing resources
			stmt.close();
			conn.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally { // Ensuring resources are closed
			try {
				if (stmt != null)
					stmt.close();
			} catch(SQLException se2) {
				
			}
			try {
				if (conn != null)
					conn.close();
			} catch(SQLException se) {
				se.printStackTrace();
			}
		}
	}
}
