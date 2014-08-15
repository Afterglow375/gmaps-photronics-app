package backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class PlateLogData
 * Handles retrieving the plate log data
 */
public class PlateLogData extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PlateLogData() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String jlnId = request.getParameter("jlnId");
		String sender = request.getParameter("sender");
		String receiver = request.getParameter("receiver");
		
		// Queries for obtaining log data
		String senderQuery = 	"SELECT s.jobs_id_fk, s.xml_data_id_fk, s.source_ste_id_fk, " + 
								"s.target_ste_id_fk, s.event, s.event_gmt, s.emp_id_fk, s.event_code, s.event_type, " + 
								"s.slg_id FROM ss2s_log@" + sender + "mt s " + 
								"WHERE s.jln_id_fk = ? " + 
								"ORDER BY s.slg_id";
		
		String receiverQuery = 	"SELECT s.jobs_id_fk, s.xml_data_id_fk, s.source_ste_id_fk, " + 
								"s.target_ste_id_fk, s.event, s.event_gmt, s.emp_id_fk, s.event_code, s.event_type, " + 
								"s.slg_id FROM ss2s_log@" + receiver + "mt s " + 
								"WHERE s.jln_id_fk = ? " + 
								"ORDER BY s.slg_id";
		
		Connection conn = null;
		PreparedStatement senderStmt = null;
		PreparedStatement receiverStmt = null;
		try {
			conn = MainData.getConnection();
			senderStmt = conn.prepareStatement(senderQuery);
			receiverStmt = conn.prepareStatement(receiverQuery);
			senderStmt.setString(1, jlnId);
			receiverStmt.setString(1, jlnId);
			PrintWriter pw = response.getWriter();
			
			// Writing the results
			ResultSet rs = senderStmt.executeQuery();
			while (rs.next()) { // Sender site log
				String row =	rs.getString("JOBS_ID_FK") + " " + rs.getString("XML_DATA_ID_FK")
								+ " " + rs.getString("SOURCE_STE_ID_FK")
								+ " " + rs.getString("TARGET_STE_ID_FK") + " " + rs.getString("EVENT")
								+ " " + rs.getString("EVENT_GMT") + " " + rs.getString("EMP_ID_FK")
								+ " " + rs.getString("EVENT_CODE") + " " + rs.getString("EVENT_TYPE")
								+ " " + rs.getString("SLG_ID") + "\n";
				pw.print(row);
			}
			pw.print("=\n");
			rs = receiverStmt.executeQuery();
			while (rs.next()) { // Receiver site log
				String row =	rs.getString("JOBS_ID_FK") + " " + rs.getString("XML_DATA_ID_FK")
								+ " " + rs.getString("SOURCE_STE_ID_FK")
								+ " " + rs.getString("TARGET_STE_ID_FK") + " " + rs.getString("EVENT")
								+ " " + rs.getString("EVENT_GMT") + " " + rs.getString("EMP_ID_FK")
								+ " " + rs.getString("EVENT_CODE") + " " + rs.getString("EVENT_TYPE")
								+ " " + rs.getString("SLG_ID") + "\n";
				pw.print(row);
			}
			
			// Closing resources
			rs.close();
			senderStmt.close();
			receiverStmt.close();
			conn.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally { // Ensuring resources are closed
			try {
				if (senderStmt != null)
					senderStmt.close();
			} catch(SQLException se2) {
				
			}
			try {
				if (receiverStmt != null)
					receiverStmt.close();
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
		
	}
}
