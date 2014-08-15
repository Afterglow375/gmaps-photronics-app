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
 * Servlet implementation class RejectCopyStatus
 */
public class RejectCopyStatus extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public RejectCopyStatus() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String jlnId = request.getParameter("jlnId");
		String sender = request.getParameter("sender");
		String receiver = request.getParameter("receiver");
		
		String query = "SELECT fromjln.plate_no AS from_plate, NVL(tojln.plate_no,0) AS to_plate," + 
		" ss2s.startdate AS start_date, ss2s.status AS status" + 
		" FROM ss2s_create_line_control@" + sender + "MT ss2s, plate_logs@" + sender + "MT fromjln, plate_logs@" + sender + "MT tojln" + 
		" WHERE ss2s.from_jln_id = fromjln.jln_id_fk AND ss2s.to_jln_id = tojln.jln_id_fk (+)" + 
		" AND ss2s.from_jln_id = ?" + 
		" UNION ALL" + 
		" SELECT fromjln.plate_no AS from_plate, NVL(tojln.plate_no,0) AS to_plate," + 
		" ss2s.startdate AS start_date, ss2s.status AS status" + 
		" FROM ss2s_create_line_control@" + sender + "MT ss2s, plate_logs@" + sender + "MT fromjln, plate_logs@" + sender + "MT tojln" + 
		" WHERE ss2s.from_jln_id = fromjln.jln_id_fk AND ss2s.to_jln_id = tojln.jln_id_fk" + 
		" AND ss2s.to_jln_id = ?" + 
		" UNION ALL" + 
		" SELECT fromjln.plate_no AS from_plate, NVL(tojln.plate_no,0) AS to_plate," + 
		" ss2s.startdate AS start_date, ss2s.status AS status" + 
		" FROM ss2s_create_line_control@" + receiver + "MT ss2s, plate_logs@" + receiver + "MT fromjln, plate_logs@" + receiver + "MT tojln" + 
		" WHERE ss2s.from_jln_id = fromjln.jln_id_fk AND ss2s.to_jln_id = tojln.jln_id_fk (+)" + 
		" AND ss2s.from_jln_id = ?" + 
		" UNION ALL" + 
		" SELECT fromjln.plate_no AS from_plate, NVL(tojln.plate_no,0) AS to_plate," + 
		" ss2s.startdate AS start_date, ss2s.status AS status" + 
		" FROM ss2s_create_line_control@" + receiver + "MT ss2s, plate_logs@" + receiver + "MT fromjln, plate_logs@" + receiver + "MT tojln" + 
		" WHERE ss2s.from_jln_id = fromjln.jln_id_fk AND ss2s.to_jln_id = tojln.jln_id_fk" + 
		" AND ss2s.to_jln_id = ?";
		
		Connection conn = null;
		PreparedStatement stmt = null;
		try {
			conn = MainData.getConnection();
			stmt = conn.prepareStatement(query);
			stmt.setString(1, jlnId);
			stmt.setString(2, jlnId);
			stmt.setString(3, jlnId);
			stmt.setString(4, jlnId);
			PrintWriter pw = response.getWriter();
			
			ResultSet rs = stmt.executeQuery();
			while (rs.next()) { // Sender site log
				String row =	rs.getString("FROM_PLATE") + " " + rs.getString("TO_PLATE")
								+ " " + rs.getString("START_DATE")
								+ " " + rs.getString("STATUS") + "\n";
				pw.print(row);
			}
			
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
	}

}
