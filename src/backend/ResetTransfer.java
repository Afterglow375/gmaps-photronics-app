package backend;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class ResetTransfer
 */
public class ResetTransfer extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ResetTransfer() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		int id = Integer.parseInt(request.getParameter("xmlId"));
		String updateStr = "UPDATE xml_data_mart SET to_be_reset = 'Y' WHERE xml_data_id = ?";
		
		Connection conn = null;
		PreparedStatement stmt = null;
		try {
			conn = MainData.getConnection();
			stmt = conn.prepareStatement(updateStr);
			stmt.setInt(1, id);
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
