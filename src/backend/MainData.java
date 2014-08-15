package backend;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class ParseToXML
 */
public class MainData extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MainData() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String query = "SELECT '<?xml version=\"1.0\" encoding=\"UTF-8\" ?>' || CHR(10) ||"
					+ " XMLTYPE.getClobVal(create_xml_report(xml_meta_data)) AS XMLDATA "
					+ "FROM xml_reports WHERE xml_report_id = 100";
		
		Connection conn = null;
		Statement stmt = null;
		ResultSet rs = null;
		try {
			conn = getConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery(query);
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
	
	// Establishes a connection with the oracle DB
	public static Connection getConnection() throws SQLException {
		try {
			Class.forName("oracle.jdbc.OracleDriver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
		Connection conn = DriverManager.getConnection("", "", "");
		return conn;
	}
}
